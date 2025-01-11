import { useState, ReactNode } from "react";
import { cn } from "@/utils";

type ConfettiButtonProps = {
  onClick?: () => void;
  className?: string;
  children: ReactNode;
  confettiText?: string;
  confettiColor?: string;
  animationDuration?: number;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const ConfettiButton = ({
  onClick,
  className,
  children,
  confettiText = "Done!",
  confettiColor = "#c5ff1a",
  animationDuration = 1000,
  ...props
}: ConfettiButtonProps) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!isAnimating) {
      setIsAnimating(true);
      onClick?.(e);
      setTimeout(() => setIsAnimating(false), animationDuration);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={cn("relative", isAnimating && "animate-confetti", className)}
      data-confetti-text={confettiText}
      style={
        {
          "--confetti-color": confettiColor,
          "--animation-duration": `${animationDuration}ms`,
        } as React.CSSProperties
      }
      {...props}
    >
      {children}
    </button>
  );
};

export default ConfettiButton;
