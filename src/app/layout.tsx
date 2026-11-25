import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import type { ReactNode } from "react";
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
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  ),
  alternates: {
    canonical: "/",
  },
  title: {
    default: "YeneSpot \u2014 Discover Local Businesses in Jimma",
    template: "%s | YeneSpot",
  },
  description:
    "Discover restaurants, cafes, hotels, shops, and trusted local businesses in Jimma, Ethiopia. Explore places, compare options, and connect with local businesses using YeneSpot.",
  applicationName: "YeneSpot",
  keywords: [
    "YeneSpot",
    "Jimma businesses",
    "Jimma Ethiopia",
    "restaurants in Jimma",
    "cafes in Jimma",
    "hotels in Jimma",
    "shops in Jimma",
    "Ethiopian local businesses",
    "local business discovery",
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  openGraph: {
    title: "YeneSpot \u2014 Discover Local Businesses in Jimma",
    description:
      "Explore restaurants, cafes, hotels, shops, and local businesses in Jimma, Ethiopia.",
    siteName: "YeneSpot",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "YeneSpot - Discover local businesses in Jimma, Ethiopia",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "YeneSpot \u2014 Discover Local Businesses in Jimma",
    description:
      "Discover local businesses and explore places in Jimma, Ethiopia.",
    images: ["/images/og-image.png"],
  },
};


// JSON-LD structured data
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "YeneSpot",
      url: siteUrl,
      description:
        "A local business discovery platform helping people discover restaurants, cafes, hotels, shops, and other businesses in Jimma, Ethiopia.",
      areaServed: {
        "@type": "City",
        name: "Jimma",
        containedInPlace: {
          "@type": "Country",
          name: "Ethiopia",
        },
      },
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      name: "YeneSpot",
      url: siteUrl,
      description:
        "Discover and explore local businesses and places in Jimma, Ethiopia.",
      publisher: {
        "@id": `${siteUrl}/#organization`,
      },
      inLanguage: ["en", "am"],
    },
  ],
};
export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
          }}
        />
        {children}
      </body>
    </html>
  );
}