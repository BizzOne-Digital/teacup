import { Suspense } from "react";
import { getMenu } from "@/lib/menu";
import { StorePage } from "@/components/StorePage";
import { SiteFooter } from "@/components/SiteFooter";

export default function Home() {
  const menu = getMenu();
  return (
    <>
      <Suspense
        fallback={
          <div className="min-h-[40vh] animate-pulse bg-stone-100" aria-hidden />
        }
      >
        <StorePage menu={menu} />
      </Suspense>
      <SiteFooter storeName={menu.storeName} />
    </>
  );
}
