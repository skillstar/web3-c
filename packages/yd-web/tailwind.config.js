/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}", // 更新路径，包含 src/app 文件夹中的所有 .tsx 文件
    "./src/components/**/*.{js,ts,jsx,tsx}", // 包含 src/app/components 中的所有 .tsx 文件
  ],
  theme: {
    extend: {
      colors: {
        // 主色调
        primary: {
          DEFAULT: "#b2f000", // 荧光绿
          light: "#c5ff1a", // 亮荧光绿
          dark: "#8bbd00", // 暗荧光绿
        },
        // 深色背景
        dark: {
          DEFAULT: "#04060c", // 深黑
          light: "#0c1018", // 稍亮的深黑
          lighter: "#161c26", // 更亮的深黑
        },
        // 辅助色
        accent: {
          green: "#b2f000", // 主色调
          purple: "#6e44ff", // 紫色点缀
          blue: "#0095ff", // 蓝色点缀
        },
        // 状态色
        state: {
          success: "#b2f000", // 成功（使用主色）
          error: "#ff4444", // 错误
          warning: "#ffb700", // 警告
          info: "#0095ff", // 信息
        },
      },
      animation: {
        breathe: "breathe 2s ease-in-out infinite",
      },
      keyframes: {
        breathe: {
          "0%": { transform: "scale(0.5)", opacity: 0.5 },
          "50%": { transform: "scale(1)", opacity: 1 },
          "100%": { transform: "scale(0.5)", opacity: 0.5 },
        },
        topBubbles: {
          "0%": {
            backgroundPosition:
              "5% 90%, 10% 90%, 10% 90%, 15% 90%, 25% 90%, 25% 90%, 40% 90%, 55% 90%, 70% 90%",
            opacity: "0",
          },
          "50%": {
            backgroundPosition:
              "0% 80%, 0% 20%, 10% 40%, 20% 0%, 30% 30%, 22% 50%, 50% 50%, 65% 20%, 90% 30%",
            opacity: "1",
          },
          "100%": {
            backgroundPosition:
              "0% 70%, 0% 10%, 10% 30%, 20% -10%, 30% 20%, 22% 40%, 50% 40%, 65% 10%, 90% 20%",
            backgroundSize: "0% 0%, 0% 0%, 0% 0%, 0% 0%, 0% 0%, 0% 0%",
            opacity: "0",
          },
        },
        bottomBubbles: {
          "0%": {
            backgroundPosition:
              "10% -10%, 30% 10%, 55% -10%, 70% -10%, 85% -10%, 70% -10%, 70% 0%",
          },
          "50%": {
            backgroundPosition:
              "0% 80%, 20% 80%, 45% 60%, 60% 100%, 75% 70%, 95% 60%, 105% 0%",
          },
          "100%": {
            backgroundPosition:
              "0% 90%, 20% 90%, 45% 70%, 60% 110%, 75% 80%, 95% 70%, 110% 10%",
            backgroundSize: "0% 0%, 0% 0%, 0% 0%, 0% 0%, 0% 0%, 0% 0%",
          },
        },
      },
      animation: {
        confetti:
          "topBubbles var(--animation-duration) ease-in-out forwards, bottomBubbles var(--animation-duration) ease-in-out forwards",
      },
      boxShadow: {
        "custom-lg":
          "0 10px 15px -3px rgba(178, 240, 0, 0.1), 0 4px 6px -2px rgba(178, 240, 0, 0.05)",
        "custom-xl":
          "0 20px 25px -5px rgba(178, 240, 0, 0.15), 0 10px 10px -5px rgba(178, 240, 0, 0.1)",
      },
    },
  },
  plugins: [require("daisyui")], //这是我们添加的内容.
};
