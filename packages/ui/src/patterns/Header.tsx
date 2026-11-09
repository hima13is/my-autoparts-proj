import { Heart, Menu, Search, ShoppingCart, UserRound } from "lucide-react"
import type { ElementType, ReactNode } from "react"
import { cn } from "../lib/cn"
import { Logo } from "../logo/Logo"

export interface HeaderProps {
  homeHref?: string
  cartHref?: string
  accountHref?: string
  wishlistHref?: string
  /** Where the search form submits (GET ?q=). */
  searchAction?: string
  cartCount?: number
  onMenu?: () => void
  /** A row under the header, e.g. <CarChip>. */
  children?: ReactNode
  linkAs?: ElementType
  className?: string
}

const iconLink =
  "on-dark relative inline-flex size-tap items-center justify-center rounded-full text-white hover:bg-white/10"

export function Header({
  homeHref = "/",
  cartHref = "/cart",
  accountHref = "/account",
  wishlistHref = "/wishlist",
  searchAction = "/search",
  cartCount = 0,
  onMenu,
  children,
  linkAs: Link = "a",
  className,
}: HeaderProps) {
  const search = (
    <form
      role="search"
      action={searchAction}
      method="get"
      className="relative order-last w-full basis-full md:order-none md:basis-auto md:flex-1"
    >
      <label htmlFor="site-search" className="sr-only">
        Search accessories
      </label>
      <Search
        aria-hidden
        className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-graphite"
      />
      <input
        id="site-search"
        name="q"
        type="search"
        placeholder="Search seat covers, dashcams…"
        className="min-h-tap w-full rounded-xl border-2 border-transparent bg-white pl-11 pr-4 text-charcoal placeholder:text-graphite"
      />
    </form>
  )

  return (
    <header className={cn("bg-ink", className)}>
      <div className="on-dark mx-auto flex max-w-7xl flex-wrap items-center gap-x-1 gap-y-2 px-3 py-2 md:flex-nowrap md:gap-4 md:px-6">
        {onMenu && (
          <button
            type="button"
            onClick={onMenu}
            aria-label="Open menu"
            className={cn(iconLink, "md:hidden")}
          >
            <Menu aria-hidden className="size-6" />
          </button>
        )}
        <Link
          href={homeHref}
          className="inline-flex min-h-tap items-center rounded-lg px-2"
          aria-label="fitgaadi home"
        >
          <Logo tone="dark" title="" className="h-6 md:h-7" />
        </Link>
        {search}
        <nav aria-label="Account and cart" className="ml-auto flex items-center">
          <Link
            href={accountHref}
            className={cn(iconLink, "hidden md:inline-flex")}
            aria-label="Account"
          >
            <UserRound aria-hidden className="size-6" />
          </Link>
          <Link href={wishlistHref} className={iconLink} aria-label="Wishlist">
            <Heart aria-hidden className="size-6" />
          </Link>
          <Link href={cartHref} className={iconLink}>
            <span className="sr-only">
              {cartCount ? `Cart, ${cartCount} ${cartCount === 1 ? "item" : "items"}` : "Cart"}
            </span>
            <ShoppingCart aria-hidden className="size-6" />
            {cartCount > 0 && (
              <span
                aria-hidden
                className="absolute right-0.5 top-0.5 grid min-w-5 place-items-center rounded-full bg-marigold px-1 text-xs font-bold leading-5 text-charcoal"
              >
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>
        </nav>
      </div>
      {children && (
        <div className="border-b border-sand bg-cream">
          <div className="mx-auto max-w-7xl px-4 md:px-6">{children}</div>
        </div>
      )}
    </header>
  )
}
