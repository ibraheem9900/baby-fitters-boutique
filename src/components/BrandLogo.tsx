import logo from "@/assets/babyfitters-logo.jpeg";

/**
 * Official Baby Fitters wordmark. The source image has a white border
 * which we crop visually with object-cover + a slight scale so the colorful
 * mark sits cleanly on transparent / pastel backgrounds without a visible
 * white box.
 */
export function BrandLogo({
  className = "",
  rounded = "rounded-2xl",
}: {
  className?: string;
  rounded?: string;
}) {
  return (
    <span className={`relative inline-block overflow-hidden ${rounded} ${className}`}>
      <img
        src={logo}
        alt="Baby Fitters"
        className="absolute inset-0 w-full h-full object-cover scale-[1.18]"
        draggable={false}
      />
    </span>
  );
}

export { logo as brandLogoSrc };
