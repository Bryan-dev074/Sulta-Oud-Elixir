import type { Metadata } from "next";
import { Cinzel, Cormorant_Garamond, Jost } from "next/font/google";
import "@/styles/globals.css";
import { CartProvider } from "@/hooks/use-cart";
import { CatalogProvider } from "@/hooks/use-catalog";
import { ParticleField } from "@/components/three/particle-field";
import { LiquidCursor } from "@/components/ui/liquid-cursor";
import { Loader } from "@/components/ui/loader";
import { Chrome } from "@/components/layout/chrome";
import { Footer } from "@/components/layout/footer";
import { CartSidebar } from "@/components/cart/cart-sidebar";
import { WhatsAppButton } from "@/components/ui/whatsapp-button";

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cinzel",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const jost = Jost({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-jost",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sultan Oud Elixir · Perfumes Árabes de Ultra-Lujo en Paraguay",
  description:
    "Importación directa de Dubai. La colección más exclusiva de fragancias árabes en Paraguay. Pago al recibir en todo el territorio nacional.",
  keywords: [
    "perfumes árabes",
    "oud",
    "Lattafa",
    "Armaf",
    "Afnan",
    "perfumes Paraguay",
    "fragancias de lujo",
    "importación Dubai",
  ],
  openGraph: {
    title: "Sultan Oud Elixir",
    description:
      "Importación directa de Dubai · Pago al recibir en todo Paraguay",
    type: "website",
    locale: "es_PY",
  },
  metadataBase: new URL("https://sultan-oud-next.vercel.app"),
};

/**
 * Capa de chrome (navbar + modal global) — Client Component.
 */
function ChromeWrapper() {
  return <Chrome />;
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      className={`${cinzel.variable} ${cormorant.variable} ${jost.variable}`}
    >
      <body className="font-sans antialiased">
        <CartProvider>
          <CatalogProvider>
            {/* Fondo 3D orgánico fijo */}
            <ParticleField />
            {/* Cursor premium con físicas líquidas */}
            <LiquidCursor />

            <Loader />

            <ChromeWrapper />
            <main className="relative z-10">{children}</main>
            <Footer />

            {/* Drawer del carrito — vive en el layout para estar siempre disponible */}
            <CartSidebar />

            {/* Botón flotante de WhatsApp — asistencia (se oculta en producto/checkout) */}
            <WhatsAppButton />
          </CatalogProvider>
        </CartProvider>
      </body>
    </html>
  );
}
