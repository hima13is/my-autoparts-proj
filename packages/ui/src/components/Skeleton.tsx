import { cn } from "../lib/cn"

/** Grey placeholder block while content loads. Hidden from screen readers. */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn("animate-pulse rounded-lg bg-sand", className)} />
}

/** Loading state for a ProductCard. Wrap a grid of these in an element with aria-busy. */
export function ProductCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "flex flex-col overflow-hidden rounded-card border border-sand bg-white",
        className
      )}
    >
      <Skeleton className="aspect-square rounded-none" />
      <div className="flex flex-col gap-2 p-3">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-5 w-1/2" />
        <Skeleton className="h-6 w-28 rounded-full" />
      </div>
    </div>
  )
}
