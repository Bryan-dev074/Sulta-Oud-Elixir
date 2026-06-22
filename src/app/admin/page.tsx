import AdminClient from "./admin-client";

export const metadata = {
  title: "Panel · Sultan Oud Elixir",
  robots: { index: false, follow: false },
};

/**
 * Panel de administración — privado.
 * Accedé en /admin con tu contraseña (ver src/data/site-config.ts).
 */
export default function AdminPage() {
  return <AdminClient />;
}
