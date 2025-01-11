import React, { useState, useEffect } from "react";

interface IncrementAnimationProps {
  targetValue: number; // 目标值
  duration: number; // 动画持续时间
}
const IncrementAnimation = ({
  targetValue,
  duration,
}: IncrementAnimationProps) => {
  const [currentValue, setCurrentValue] = useState(0);

  useEffect(() => {
    const start = performance.now();
    const end = targetValue;
    const incrementDuration = duration;
    const step = (timestamp: number) => {
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / incrementDuration, 1);
      const newValue = Math.floor(progress * end);
      setCurrentValue(newValue);

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);

    return () => setCurrentValue(0);
  }, [targetValue, duration]);

  return <span>{currentValue}</span>;
};

export default IncrementAnimation;
