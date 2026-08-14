import type { Metadata } from "next";
import { Jost } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const jost = Jost({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  variable: "--font-jost",
  display: "swap",
});

export const metadata: Metadata = {
  title: "BeBooked — Your calendar, fully loaded.",
  description:
    "BeBooked helps beauty professionals in Charlotte, NC fill last-minute openings. Post a slot, share a link, get booked.",
  openGraph: {
    title: "BeBooked — Your calendar, fully loaded.",
    description:
      "Fill your last-minute openings. Post a slot, share your link, get booked. Launching in Charlotte, NC.",
    url: "https://bebookedtoday.com",
    siteName: "BeBooked",
    locale: "en_US",
    type: "website",
  },
};

const clerkLocalization = {
  signIn: {
    start: {
      title: "Welcome back",
      subtitle: "Sign in to manage your slots.",
      actionText: "New to Bebooked?",
      actionLink: "Create your profile",
    },
  },
  signUp: {
    start: {
      title: "Create your profile",
      subtitle: "Start filling last-minute openings.",
      actionText: "Already have an account?",
      actionLink: "Sign in",
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider localization={clerkLocalization}>
      <html lang="en" className={jost.variable}>
        <body className="min-h-screen">{children}</body>
      </html>
    </ClerkProvider>
  );
}
