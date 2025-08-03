import { cn } from "$/lib/utils";

interface ProgressiveBlurMaskProps {
  /** Direction of the blur gradient */
  direction?: "to bottom" | "to top" | "to left" | "to right";
  /** Where the transparency ends and blur begins (0-100) */
  transparentPoint?: number;
  /** Additional CSS classes */
  className?: string;
  /** Custom style overrides */
  style?: React.CSSProperties;
}

export default function ProgressiveBlurMask({
  direction = "to bottom",
  transparentPoint = 60,
  className,
  style,
}: ProgressiveBlurMaskProps) {
  const maskGradient = `linear-gradient(${direction}, transparent ${transparentPoint}%, black 100%)`;

  return (
    <div
      className={cn(
        "absolute inset-0 backdrop-blur-sm bg-gradient-to-b from-transparent to-black/10",
        className
      )}
      style={{
        maskImage: maskGradient,
        WebkitMaskImage: maskGradient,
        ...style,
      }}
    />
  );
}
