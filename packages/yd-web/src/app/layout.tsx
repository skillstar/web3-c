import "./globals.css";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { type ReactNode } from "react";
import 'dotenv/config'  
import { cookieToInitialState } from "wagmi";
import "@rainbow-me/rainbowkit/styles.css";
import { getConfig } from "../wagmi";
import { Providers } from "./providers";
// 使用系统默认字体
export const metadata: Metadata = {
  title: "Web3 Course Platform",
  description: "Buy courses using tokens.",
};

export default function RootLayout(props: { children: ReactNode }) {
  const initialState = cookieToInitialState(
    getConfig(),
    headers().get("cookie")
  );
  return (
    <html lang="en" className="bg-gray-100">
      <body
        className="min-h-screen"
        style={{
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        }}
      >
        <Providers initialState={initialState}>{props.children}</Providers>
      </body>
    </html>
  );
}
