import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ProofPi – Pi Network Certificate Issuer",
  description: "Issue and verify skill certificates on Pi Network - No MetaMask required",
  keywords: "Pi Network, certificates, blockchain, skills, verification",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* Pi SDK Script - Official Pi Network SDK */}
        <script src="https://sdk.minepi.com/pi-sdk.js" async crossOrigin="anonymous"></script>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#6b21a8" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
