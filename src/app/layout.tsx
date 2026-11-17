import type { Metadata, Viewport } from "next";
import { Fraunces, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/toast";
import { ServiceWorker } from "@/components/sw-register";
import { BrandGradients } from "@/components/brand/gradients";
import { SmoothScroll } from "@/components/smooth-scroll";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz"],
});
const jakarta = Plus_Jakarta_Sans({ variable: "--font-jakarta", subsets: ["latin"] });
const jetbrains = JetBrains_Mono({ variable: "--font-jetbrains", subsets: ["latin"] });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Covalent — bonds are shared, not swiped", template: "%s · Covalent" },
  description:
    "A dating app for verified young professionals. Three people a day, no swiping, photos that sharpen as you get to know each other.",
  applicationName: "Covalent",
  appleWebApp: { capable: true, title: "Covalent", statusBarStyle: "default" },
  openGraph: {
    title: "Covalent",
    description: "Bonds are shared, not swiped.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FBF7F1" },
    { media: "(prefers-color-scheme: dark)", color: "#120E18" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

// Applies a saved theme choice before paint to avoid a flash.
const themeScript = `try{var t=localStorage.getItem('covalent-theme');if(t==='light'||t==='dark'){document.documentElement.dataset.theme=t}}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en-IN"
      suppressHydrationWarning
      className={`${fraunces.variable} ${jakarta.variable} ${jetbrains.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full">
        <BrandGradients />
        <div className="relative z-10 min-h-full">{children}</div>
        <Toaster />
        <ServiceWorker />
        <SmoothScroll />
      </body>
    </html>
  );
}
