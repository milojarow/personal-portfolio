/**
 * Typographic monogram avatar — editorial default.
 * When a real photo is available, drop it as `public/rolando.jpg`
 * and swap the innards for `<Image src="/rolando.jpg" ... />`.
 */
export default function Avatar({ size = 64, alt = "Rolando Ahuja Martínez" }) {
  return (
    <div
      role="img"
      aria-label={alt}
      className="inline-flex items-center justify-center rounded-full bg-base-200 ring-1 ring-base-300 text-base-content select-none"
      style={{
        width: size,
        height: size,
        fontFamily: "var(--font-display)",
        fontSize: size * 0.42,
        fontWeight: 500,
        letterSpacing: "-0.02em",
      }}
    >
      RA
    </div>
  );
}
