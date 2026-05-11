import logo from "@/assets/babyfitters-logo.jpeg";

/**
 * Official Baby Fitters wordmark.
 * - `fit="contain"` (default for navbar/footer) preserves full wordmark.
 * - `fit="cover"` crops to fill — used for square avatar-style placements.
 */
export function BrandLogo({
  className = "",
  rounded = "rounded-xl",
  fit = "contain",
}: {
  className?: string;
  rounded?: string;
  fit?: "contain" | "cover";
}) {
  return (
    <span
      className={`relative inline-block overflow-hidden ${rounded} ${className}`}
      style={{ background: "transparent" }}
    >
      <img
        src={logo}
        alt="Baby Fitters"
        className={`absolute inset-0 w-full h-full ${
          fit === "cover" ? "object-cover scale-[1.18]" : "object-contain"
        }`}
        style={{ mixBlendMode: "multiply" }}
        draggable={false}
      />
    </span>
  );
}

export { logo as brandLogoSrc };
