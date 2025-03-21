import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'mDL Verification',
  description: 'Mobile Driver License Verification',
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
      <meta 
          httpEquiv="origin-trial" 
          content="A6nyOPpoSpvWZVtIfU5Gl5G81iARWOE8v1ZaEDnz2erlyiJyK6CYqLUbI+QwNch/6JsV51BlasHAIlcJPHhJYg4AAACIeyJvcmlnaW4iOiJodHRwczovL2hvYmJzLndvcms6NDQzIiwiZmVhdHVyZSI6IldlYklkZW50aXR5RGlnaXRhbENyZWRlbnRpYWxzIiwiZXhwaXJ5IjoxNzUzMTQyNDAwLCJpc1N1YmRvbWFpbiI6dHJ1ZSwiaXNUaGlyZFBhcnR5Ijp0cnVlfQ==" 
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
