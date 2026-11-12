import { SiteShell } from "@/components/site-shell"
import { getVehicleCatalog } from "@/lib/vehicles"

/** Shop pages: real header with the car chip, vehicle selector and footer. */
export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const catalog = await getVehicleCatalog()
  return <SiteShell catalog={catalog}>{children}</SiteShell>
}
