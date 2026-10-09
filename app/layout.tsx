import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
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
  title: "London climate tracker",
  description: "Live heat, air and rain readings for London, UK, with local climate actions.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <nav
          aria-label="Main"
          className="mx-auto flex w-full max-w-6xl items-center px-4 pt-3 text-sm sm:px-8 sm:pt-8"
        >
          <Link href="/" className="flex items-center gap-2 font-medium">
            <span aria-hidden className="h-2 w-2 rounded-full bg-accent" />
            London climate
          </Link>
        </nav>
        {children}
        <p className="mx-auto w-full max-w-6xl px-4 pb-8 text-sm text-muted sm:px-8">
          <Link
            href="/how-its-checked"
            className="underline-offset-4 transition-colors hover:text-foreground hover:underline"
          >
            How it&apos;s checked
          </Link>
        </p>
      </body>
    </html>
  );
}
