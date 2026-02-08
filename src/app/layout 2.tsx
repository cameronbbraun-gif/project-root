import type { Metadata } from "next";
import WebflowScripts from "./WebflowScripts";

export const metadata: Metadata = {
  title: "Mobile Car Detailing - Wesley Chapel & Tampa - Detail Geeks Auto Spa",
  description: "Professional mobile car detailing service in Wesley Chapel and Tampa.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link rel="stylesheet" href="/css/normalize.css" />
        <link rel="stylesheet" href="/css/webflow.css" />
        <link rel="stylesheet" href="/css/style.css" />
        <link rel="shortcut icon" href="/images/favicon.png" />
        <link rel="apple-touch-icon" href="/images/webclip.png" />
      </head>

      <body>
        <WebflowScripts />
        {children}
      </body>
    </html>
  );
}