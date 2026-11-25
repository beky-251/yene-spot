import type { Metadata } from "next";
import ContactClient from "./contact-client";

export const metadata: Metadata = {
  title: "Contact YeneSpot: Get in Touch",
  description:
    "Contact YeneSpot with questions, suggestions, or business inquiries. We are helping people discover local businesses in Jimma, Ethiopia.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contact YeneSpot: Get in Touch",
    description:
      "Contact YeneSpot with questions, suggestions, or business inquiries. Discover local businesses in Jimma, Ethiopia.",
    url: "/contact",
    type: "website",
    images: ["/images/og-image.png"],
  },
};

export default function ContactPage() {
  return <ContactClient />;
}