"use client";
import { useEffect, useRef } from "react";

export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const d = canvasRef.current;
    const ctx = d.getContext("2d");
    if (!ctx) return;

    // 初始化设置
    let w = (d.width = window.innerWidth);
    let h = (d.height = window.innerHeight);

    // 参数设置
    const total = (w / 8) | 0;
    const acceleration = 0.05;
    const lineAlpha = 0.02;
    const range = 25;

    // 计算和数组初始化
    const size = w / total;
    const occupation = w / total;
    const repaintColor = "rgba(0, 0, 0, .04)";
    const colors: number[] = [];
    const dots: number[] = [];
    const dotsVel: number[] = [];

    // 初始化点的属性
    const portion = 360 / total;
    for (let i = 0; i < total; ++i) {
      colors[i] = portion * i;
      dots[i] = h;
      dotsVel[i] = 10;
    }

    // 动画函数
    function anim() {
      if (!ctx) return;

      window.requestAnimationFrame(anim);

      ctx.fillStyle = repaintColor;
      ctx.fillRect(0, 0, w, h);

      for (let i = 0; i < total; ++i) {
        dots[i] += dotsVel[i] += acceleration;

        for (let j = i + 1; j < i + range && j < total; ++j) {
          if (Math.abs(dots[i] - dots[j]) <= range * size) {
            ctx.strokeStyle = `hsla(${(colors[i] + colors[j] + 360) / 2 - 180}, 80%, 50%, ${lineAlpha})`;
            ctx.beginPath();
            ctx.moveTo(i * occupation, dots[i]);
            ctx.lineTo(j * occupation, dots[j]);
            ctx.stroke();
          }
        }

        if (dots[i] > h && Math.random() < 0.01) {
          dots[i] = dotsVel[i] = 0;
        }
      }
    }

    // 处理窗口大小变化
    const handleResize = () => {
      w = d.width = window.innerWidth;
      h = d.height = window.innerHeight;
    };

    // 开始动画
    anim();

    // 添加窗口大小变化监听
    window.addEventListener("resize", handleResize);

    // 清理函数
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []); // 空依赖数组，仅在组件挂载时运行一次

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full z-[0]"
    />
  );
}
