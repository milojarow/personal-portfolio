---
title: "Caja negra de ICARUS: qué pasa cuando un VPS se ahoga en su propia basura"
date: 2026-04-21
description: "Maté un VPS de producción después de 18 meses. No murió por tráfico ni por un hackeo — se ahogó en snapshots huérfanos, logs sin rotar y un disco que mentía. Si corres k3s o Docker en un VPS, esta es la advertencia que quieres antes del incendio."
tags: [vps, k3s, docker, post-mortem, sysadmin]
---

> *"Si estás leyendo esto, ICARUS ya no existe. Esta grabación contiene todo lo que salió mal y cómo evitar que te pase lo mismo. No la ignores."*
>
> — Última transmisión, marzo 2026

## Qué era ICARUS

- **Proveedor**: Hostinger VPS
- **OS**: Arch Linux
- **Specs**: 2 vCPU, 8GB RAM, 100GB SSD
- **Motor principal**: k3s (Kubernetes ligero)
- **Motor secundario**: CapRover (Docker Swarm) — convivían en el mismo host
- **Período de operación**: agosto 2024 — marzo 2026

Al final corría: 35 pods, ~4.3GB RAM, 12 servicios. Poste.io para email en 4 dominios, dos instancias de n8n (personal + cliente), KaraKEEP, Firefly III, Etebase (CalDAV / CardDAV), MongoDB, WireGuard, CloudBeaver, y un API custom en Node.js para un producto SaaS. Dominios servidos: `rolandoahuja.com`, `centrocristianogosen.org`, `blindandosueños.com`, `solutions45.com`.

## Cómo murió

No por tráfico. No por intrusión. No por problemas del proveedor. **ICARUS se ahogó en su propia basura.**

A los 18 meses, `df -h /` reportaba 93% usado — 90GB de 100GB. Pánico. Solo que `du -x -sh /` mostraba apenas 23GB de datos reales. Algo estaba contando cosas múltiples veces.

Ese algo eran los **snapshots de overlayfs**.

## Los errores, por severidad

### 1. Confiar en `df` en un host con contenedores

`df` ve cada mount de overlayfs que k3s apila para cada contenedor. Cada vez que un pod reinicia, cada vez que se hace pull de una imagen, nuevas capas se montan desde `/var/lib/rancher/k3s/agent/containerd/`. El kernel reporta esas capas como pertenecientes a `/dev/sda3`, así que `df` las cuenta múltiples veces.

Realidad: 23GB en disco. `df` reportaba 90GB. La diferencia eran fantasmas.

```bash
# Uso real
du -x -d1 -h / 2>/dev/null | sort -rh | head -15
# Huella de imágenes
crictl images | sort -k3 -rh
```

### 2. 496 snapshots de containerd que nadie limpió nunca (14GB)

Cada pull de imagen — cada upgrade de n8n, cada bump de cualquier app — dejaba las capas viejas como snapshots huérfanos en `/var/lib/rancher/k3s/agent/containerd/io.containerd.snapshotter.v1.overlayfs/snapshots/`. **k3s no configura garbage collection por defecto.** En 18 meses: 496 snapshots, 14GB de peso muerto, cero reclamo.

### 3. Sin rotación de logs

- No había `/etc/logrotate.d/k3s`
- No había `/etc/logrotate.d/containerd`
- Los logs de `/var/lib/kubelet/` llegaron a 1.4GB
- Cero límite de tamaño por contenedor

### 4. Cache de pacman sin límite

`/var/cache/pacman/pkg/` acumuló 1.6GB de paquetes descargados. `paccache.timer` nunca se habilitó.

### 5. Dos archivos de swap

Creé un swap de 512MB al instalar. Meses después, cuando la RAM no alcanzaba, agregué otro de 4GB. Quedaron dos, total 4.5GB. Desperdicié disco y desperdicié cordura operacional.

### 6. Tags `:latest` en imágenes

Algunos manifests usaban `image: xxx:latest`. Por qué es un desastre:

1. No sabes qué versión está corriendo sin inspeccionar el contenedor.
2. Cada pull baja una versión nueva pero la vieja queda como snapshot sin tag, invisible.
3. Imposible hacer rollback limpio.

Apps que tenían `:latest`: Etebase, CloudBeaver, Firefly, Poste.io, WireGuard.

### 7. Sin monitoreo, sin alertas

El disco llegó a 93% (aparente) sin ningún aviso. Cero cron de monitoreo. Cero alertas. Cero dashboards. Me enteré por accidente investigando algo no relacionado.

### 8. Sin backups

Cero CronJobs de backup. Cero scripts de respaldo. Todo el estado de producción — emails, definiciones de workflows, registros financieros, contactos — vivía en un solo disco sin copia.

## Qué haría diferente, desde el día cero

### Antes de instalar nada

```bash
# Un solo swap, tamaño definitivo
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap defaults 0 0' >> /etc/fstab

# Limpieza automática de cache de pacman
pacman -S pacman-contrib
systemctl enable --now paccache.timer

# Limitar journal de systemd
mkdir -p /etc/systemd/journald.conf.d
cat > /etc/systemd/journald.conf.d/size.conf << 'EOF'
[Journal]
SystemMaxUse=200M
EOF
systemctl restart systemd-journald
```

### Configurar k3s ANTES de instalarlo

Crear el config antes de correr el instalador — k3s lee `/etc/rancher/k3s/config.yaml` en el primer arranque:

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

- `image-gc-high-threshold=80` — cuando el disco de imágenes pase 80%, empieza a borrar imágenes viejas
- `image-gc-low-threshold=70` — borra hasta bajar a 70%
- `eviction-hard` — si el disco libre baja de 10%, evacúa pods
- `container-log-max-files=3` + `container-log-max-size=10Mi` — tope de logs por contenedor

### Cron de limpieza semanal

```bash
cat > /etc/cron.weekly/k3s-cleanup << 'SCRIPT'
#!/bin/bash
/usr/local/bin/k3s crictl rmi --prune 2>/dev/null
echo "$(date): k3s cleanup ejecutado" >> /var/log/k3s-cleanup.log
SCRIPT
chmod +x /etc/cron.weekly/k3s-cleanup
```

### Monitoreo de disco (con `du`, no con `df`)

```bash
cat > /etc/cron.daily/disk-check << 'SCRIPT'
#!/bin/bash
USAGE_KB=$(du -x -s / 2>/dev/null | awk '{print $1}')
USAGE_GB=$((USAGE_KB / 1024 / 1024))
if [ "$USAGE_GB" -gt 75 ]; then
    echo "ALERTA DISCO: uso real ${USAGE_GB}GB / 100GB" | logger -t disk-alert
fi
SCRIPT
chmod +x /etc/cron.daily/disk-check
```

Conectar la alerta a un bot de Telegram, un webhook, o n8n si quieres notificaciones reales en lugar de entradas de syslog.

### Regla de oro para manifests

**Siempre tags fijos. Nunca `:latest`.**

Antes de escribir un manifest, buscar la última versión estable en Docker Hub y fijarla:

```yaml
# MAL
image: victorrds/etebase:latest

# BIEN
image: victorrds/etebase:0.14.2
```

Para upgradear: cambias el tag, `kubectl apply`. La imagen vieja se limpia sola gracias al GC configurado en el paso 2.

## Exposición de puertos: la lección más cara

### Puertos estándar (email, SSH): usar `hostPort`

```yaml
containers:
- name: poste
  ports:
  - containerPort: 25
    hostPort: 25       # se bindea directo en la interfaz del host
    name: smtp
```

k3s CNI crea la regla iptables DNAT automáticamente. Funciona inmediatamente. Es el equivalente al `-p 25:25` de Docker.

### Servicios web que conviven con otro reverse proxy: usar `NodePort`

```yaml
service:
  type: NodePort
  ports:
  - port: 80
    nodePort: 31080    # puerto alto, no choca con nada
```

### Nunca uses NodePort + iptables manual para puertos estándar

Lo intenté con el servidor de email. Fue un desastre. `hostPort` existe exactamente para este caso.

## Lo que había que respaldar (y no se respaldó)

Todo vivía en `/var/lib/rancher/k3s/storage/` como PVCs del local-path provisioner:

| Dato | Tamaño real | Prioridad |
|------|-------------|-----------|
| Poste.io data + DB (emails, DKIM, SSL, dominios) | ~200MB | CRÍTICA |
| Firefly III MariaDB | ~222MB | CRÍTICA |
| n8n cliente Postgres (workflows, credenciales) | ~217MB | CRÍTICA |
| n8n personal Postgres | ~90MB | ALTA |
| MongoDB (backend del cliente) | ~458MB | ALTA |
| Etebase (calendario, contactos) | ~65MB | ALTA |
| KaraKEEP + Meilisearch | ~97MB | MEDIA |

**Total: ~1.4GB.** Un solo CronJob diario que empacara estos PVCs a un blob externo hubiera salvado cada pieza crítica de estado. Nunca corrió.

Las claves DKIM, los certificados SSL y toda la config de dominios virtuales viven **dentro** del volumen `poste-data-pvc` (montado en `/data`). Al respaldar ese PVC, respaldas la identidad completa del correo. Al restaurarlo, los emails no caen en spam.

Los tamaños declarados de los PVCs (20Gi, 10Gi, 5Gi) son **límites teóricos, no reservas**. El local-path provisioner crea un directorio vacío. Un PVC de "20Gi" con 53MB de datos, ocupa 53MB. No multipliques tamaños declarados al presupuestar disco.

## Checklist post-instalación

Correr esto cuando armes el siguiente. Cada línea debe decir OK:

```bash
[ $(swapon --show --noheadings | wc -l) -eq 1 ] && echo "OK: un solo swap" || echo "FAIL: múltiples swaps"
grep -q "image-gc" /etc/rancher/k3s/config.yaml && echo "OK: image GC" || echo "FAIL: sin image GC"
grep -q "container-log-max" /etc/rancher/k3s/config.yaml && echo "OK: log limits" || echo "FAIL: sin log limits"
[ -x /etc/cron.weekly/k3s-cleanup ] && echo "OK: cleanup cron" || echo "FAIL: sin cleanup cron"
systemctl is-active paccache.timer &>/dev/null && echo "OK: paccache.timer" || echo "FAIL: paccache.timer inactivo"
[ -f /etc/systemd/journald.conf.d/size.conf ] && echo "OK: journal acotado" || echo "FAIL: journal sin límite"
[ -x /etc/cron.daily/disk-check ] && echo "OK: monitor de disco" || echo "FAIL: sin monitor de disco"
grep -r "image:.*:latest" /root/k3s-manifests/ &>/dev/null && echo "FAIL: hay tag :latest" || echo "OK: sin tags :latest"
```

---

> *"ICARUS no murió por falta de poder. Murió ahogado en su propia basura — snapshots fantasma, logs sin rotar, y la ilusión de un disco lleno que no lo estaba. No dejes que te pase lo mismo."*
