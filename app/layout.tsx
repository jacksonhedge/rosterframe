import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Roster Frame - Custom Fantasy Sports Plaques",
  description: "Create custom frames featuring your fantasy team players with sports cards. Premium quality plaques in Wood, Glass, and Acrylic finishes. Order your personalized display today!",
  keywords: "fantasy sports, custom frames, sports cards, plaques, fantasy football, fantasy baseball, personalized gifts",
  authors: [{ name: "Roster Frame" }],
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png" },
      { url: "/images/RosterFrameLogo.png", type: "image/png", sizes: "any" }
    ],
    shortcut: "/favicon.png",
    apple: "/images/RosterFrameLogo.png",
  },
  openGraph: {
    title: "Roster Frame - Custom Fantasy Sports Plaques",
    description: "Transform your fantasy roster into a legendary display with premium custom frames.",
    type: "website",
    images: [
      {
        url: "/images/RosterFrameBackground.png",
        width: 1200,
        height: 630,
        alt: "Roster Frame - Custom Fantasy Sports Plaques",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Roster Frame - Custom Fantasy Sports Plaques",
    description: "Transform your fantasy roster into a legendary display with premium custom frames.",
    images: ["/images/RosterFrameBackground.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="shortcut icon" href="/favicon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/images/RosterFrameLogo.png" />
        <meta name="theme-color" content="#d97706" />
        <meta name="msapplication-TileColor" content="#d97706" />
      </head>
      <body
        className={`${inter.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
