---
title: "Black box from ICARUS: what happens when a VPS drowns in its own garbage"
date: 2026-04-21
description: "I killed a production VPS after 18 months. It didn't die from traffic or hacking — it drowned in orphan snapshots, unrotated logs, and a disk that lied. If you run k3s or Docker on a VPS, this is the cautionary tale you want before the fire."
tags: [vps, k3s, docker, post-mortem, sysadmin]
---

> *"If you're reading this, ICARUS is gone. This recording contains everything that went wrong and how to stop it happening to you. Don't ignore it."*
>
> — Last transmission, March 2026

## What ICARUS was

- **Provider**: Hostinger VPS
- **OS**: Arch Linux
- **Specs**: 2 vCPU, 8GB RAM, 100GB SSD
- **Main engine**: k3s (lightweight Kubernetes)
- **Secondary engine**: CapRover (Docker Swarm) — coexisting on the same host
- **Lifespan**: August 2024 — March 2026

Running at the end: 35 pods, ~4.3GB RAM, 12 services. Poste.io email across 4 domains, two n8n instances (personal + client), KaraKEEP, Firefly III, Etebase (CalDAV / CardDAV), MongoDB, WireGuard, CloudBeaver, plus a custom Node.js API for a SaaS product. Domains served: `rolandoahuja.com`, `centrocristianogosen.org`, `blindandosueños.com`, `solutions45.com`.

## How it died

Not from traffic. Not from an intrusion. Not from provider issues. **ICARUS drowned in its own garbage.**

After 18 months, `df -h /` reported 93% used — 90GB of 100GB. Panic. Except `du -x -sh /` reported only 23GB of real data. Something was counting things many times over.

That something was **overlayfs snapshots**.

## The errors, in order of severity

### 1. Trusting `df` on a container host

`df` sees every overlayfs mount that k3s stacks up for every container. Every time a pod restarts, every time an image is pulled, new layers get mounted from `/var/lib/rancher/k3s/agent/containerd/`. The kernel reports those layers as belonging to `/dev/sda3`, so `df` counts them multiple times.

Reality: 23GB on disk. `df` reported 90GB. The gap was ghosts.

```bash
# Real usage
du -x -d1 -h / 2>/dev/null | sort -rh | head -15
# Image footprint
crictl images | sort -k3 -rh
```

### 2. 496 containerd snapshots nobody ever cleaned (14GB)

Every image pull — every n8n upgrade, every app bump — left the old layers as orphan snapshots in `/var/lib/rancher/k3s/agent/containerd/io.containerd.snapshotter.v1.overlayfs/snapshots/`. **k3s does not configure garbage collection by default.** In 18 months: 496 snapshots, 14GB of dead weight, zero reclaim.

### 3. No log rotation

- No `/etc/logrotate.d/k3s`
- No `/etc/logrotate.d/containerd`
- `/var/lib/kubelet/` logs hit 1.4GB
- No per-container log size limit

### 4. Pacman cache unbounded

`/var/cache/pacman/pkg/` accumulated 1.6GB of downloaded packages. `paccache.timer` was never enabled.

### 5. Two swap files

Created one 512MB swap at install. Months later when RAM pressure hit, added a second 4GB swap. Now there were two, totaling 4.5GB. Wasted disk and wasted operational sanity.

### 6. `:latest` tags on images

Some manifests used `image: xxx:latest`. Why this is a disaster:

1. You can't tell what version is actually running without inspecting the container.
2. Every pull downloads a new version but leaves the old as an untagged, invisible snapshot.
3. No clean rollback is possible.

Apps that had `:latest`: Etebase, CloudBeaver, Firefly, Poste.io, WireGuard.

### 7. No monitoring, no alerts

The disk hit 93% (apparent) with zero warning. No monitoring cron. No alerts. No dashboards. Found out by accident while investigating something unrelated.

### 8. No backups

Zero backup CronJobs. Zero backup scripts. Every production piece of state — emails, workflow definitions, financial records, contacts — lived on one disk with no copy.

## What I'd do differently, from day zero

### Before installing anything

```bash
# Single swap, final size
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap defaults 0 0' >> /etc/fstab

# Pacman cache auto-clean
pacman -S pacman-contrib
systemctl enable --now paccache.timer

# Cap systemd journal
mkdir -p /etc/systemd/journald.conf.d
cat > /etc/systemd/journald.conf.d/size.conf << 'EOF'
[Journal]
SystemMaxUse=200M
EOF
systemctl restart systemd-journald
```

### Configure k3s BEFORE installing it

Create the config before running the installer — k3s reads `/etc/rancher/k3s/config.yaml` on first boot:

```yaml
disable:
  - traefik
  - servicelb
kubelet-arg:
  - "image-gc-high-threshold=80"
  - "image-gc-low-threshold=70"
  - "eviction-hard=nodefs.available<10%,imagefs.available<10%"
  - "container-log-max-files=3"
  - "container-log-max-size=10Mi"
```

- `image-gc-high-threshold=80` — when image disk hits 80%, start deleting old images
- `image-gc-low-threshold=70` — delete until below 70%
- `eviction-hard` — if disk free goes below 10%, evict pods
- `container-log-max-files=3` + `container-log-max-size=10Mi` — cap per-container logs

### Weekly cleanup cron

```bash
cat > /etc/cron.weekly/k3s-cleanup << 'SCRIPT'
#!/bin/bash
/usr/local/bin/k3s crictl rmi --prune 2>/dev/null
echo "$(date): k3s cleanup ran" >> /var/log/k3s-cleanup.log
SCRIPT
chmod +x /etc/cron.weekly/k3s-cleanup
```

### Disk monitoring (using `du`, not `df`)

```bash
cat > /etc/cron.daily/disk-check << 'SCRIPT'
#!/bin/bash
USAGE_KB=$(du -x -s / 2>/dev/null | awk '{print $1}')
USAGE_GB=$((USAGE_KB / 1024 / 1024))
if [ "$USAGE_GB" -gt 75 ]; then
    echo "DISK ALERT: real usage ${USAGE_GB}GB / 100GB" | logger -t disk-alert
fi
SCRIPT
chmod +x /etc/cron.daily/disk-check
```

Pipe the alert to a Telegram bot, a webhook, or n8n if you want actual notifications instead of syslog entries.

### Golden rule for manifests

**Always pinned tags. Never `:latest`.**

Before writing a manifest, look up the latest stable tag on Docker Hub and pin it:

```yaml
# NEVER
image: victorrds/etebase:latest

# ALWAYS
image: victorrds/etebase:0.14.2
```

To upgrade: change the tag, `kubectl apply`. The old image gets garbage-collected because of the GC config from step 2.

## Port exposure: the most expensive lesson

### Standard ports (email, SSH): use `hostPort`

```yaml
containers:
- name: poste
  ports:
  - containerPort: 25
    hostPort: 25       # binds directly on host interface
    name: smtp
```

k3s CNI adds the iptables DNAT automatically. Works immediately. Equivalent to Docker's `-p 25:25`.

### Web services coexisting with another reverse proxy: use `NodePort`

```yaml
service:
  type: NodePort
  ports:
  - port: 80
    nodePort: 31080    # high port, no collision
```

### Never use NodePort plus manual iptables for standard ports

I tried this for email. It was a disaster. `hostPort` exists for exactly this case.

## What should have been backed up (and wasn't)

All of this lived in `/var/lib/rancher/k3s/storage/` as PVCs from the local-path provisioner:

| Data | Real size | Priority |
|------|-----------|----------|
| Poste.io data + DB (emails, DKIM, SSL, domains) | ~200MB | CRITICAL |
| Firefly III MariaDB | ~222MB | CRITICAL |
| n8n client Postgres (workflows, credentials) | ~217MB | CRITICAL |
| n8n personal Postgres | ~90MB | HIGH |
| MongoDB (client backend data) | ~458MB | HIGH |
| Etebase (calendar, contacts) | ~65MB | HIGH |
| KaraKEEP + Meilisearch | ~97MB | MEDIUM |

**Total: ~1.4GB.** A single daily CronJob tarring these PVCs to an off-site blob would have saved every critical piece of state. It never ran.

DKIM keys, SSL certs, and virtual domain config all live **inside** the `poste-data-pvc` volume (mounted at `/data`). Back up that PVC, you back up the full email identity. Restore it, emails don't land in spam.

PVC declared sizes (20Gi, 10Gi, 5Gi) are **theoretical limits, not reservations**. The local-path provisioner creates an empty directory. A "20Gi" PVC with 53MB of data occupies 53MB. Don't multiply declared sizes when budgeting disk.

## Post-install checklist

Run this after you build the next one. Every line must say OK:

```bash
[ $(swapon --show --noheadings | wc -l) -eq 1 ] && echo "OK: single swap" || echo "FAIL: multiple swaps"
grep -q "image-gc" /etc/rancher/k3s/config.yaml && echo "OK: image GC" || echo "FAIL: no image GC"
grep -q "container-log-max" /etc/rancher/k3s/config.yaml && echo "OK: log limits" || echo "FAIL: no log limits"
[ -x /etc/cron.weekly/k3s-cleanup ] && echo "OK: cleanup cron" || echo "FAIL: no cleanup cron"
systemctl is-active paccache.timer &>/dev/null && echo "OK: paccache.timer" || echo "FAIL: paccache.timer inactive"
[ -f /etc/systemd/journald.conf.d/size.conf ] && echo "OK: journal capped" || echo "FAIL: journal uncapped"
[ -x /etc/cron.daily/disk-check ] && echo "OK: disk monitor" || echo "FAIL: no disk monitor"
grep -r "image:.*:latest" /root/k3s-manifests/ &>/dev/null && echo "FAIL: :latest tag present" || echo "OK: no :latest tags"
```

---

> *"ICARUS didn't die from lack of power. It drowned in its own trash — ghost snapshots, unrotated logs, and the illusion of a full disk that wasn't. Don't let it happen to you."*
