import type { Metadata, Viewport } from "next";
import { Archivo, Inter_Tight, JetBrains_Mono } from "next/font/google";
import { project, tagline } from "@/data/building";
import "./globals.css";

/** Titulares: grotesca variable con eje de ancho (mayúsculas anchas, DESIGN §3). */
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
});

/** Texto y UI. */
const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
});

/** Labels, numeración y metadatos técnicos. */
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

/** En Vercel, la URL de producción; en local, el servidor de desarrollo. */
const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "http://localhost:3000";

const title = `${project.name} — ${project.address}`;
const description = `${tagline} Entrega estimada ${project.delivery}.`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  applicationName: project.name,
  openGraph: {
    type: "website",
    locale: "es_AR",
    siteName: project.name,
    title,
    description,
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export const viewport: Viewport = {
  themeColor: "#fafaf8",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es-AR"
      data-intro="pending"
      className={`${archivo.variable} ${interTight.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-paper font-sans text-ink">
        {/* Sin JS no hay loader ni entrada animada: todo visible de entrada. */}
        <noscript dangerouslySetInnerHTML={{ __html: "<style>html[data-intro]{overflow:auto}[data-loader]{display:none}html[data-intro] [data-intro],html[data-intro] [data-scene-fade]{opacity:1}</style>" }} />
        {children}
      </body>
    </html>
  );
}
