import { Link } from "@/i18n/navigation";

export default function Banner() {
  return (
    <header className="site-banner">
      <Link href="/" className="site-banner-logo" aria-label="rolandoahuja.com">
        <span className="logo-left">ROLANDO</span>
        <span className="logo-right">AHUJA</span>
      </Link>
    </header>
  );
}
