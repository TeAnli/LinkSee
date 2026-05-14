import * as React from "react"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface PaginationProps {
  page: number
  total: number
  pageSize?: number
  onChange: (page: number) => void
  siblingCount?: number
  className?: string
}

function generateRange(start: number, end: number): number[] {
  const length = end - start + 1
  return Array.from({ length }, (_, i) => start + i)
}

function usePaginationRange({
  page,
  total,
  pageSize = 10,
  siblingCount = 1,
}: {
  page: number
  total: number
  pageSize?: number
  siblingCount?: number
}) {
  const totalPages = Math.ceil(total / pageSize)

  // Total page numbers to show: first + last + current + siblings + 2 ellipsis
  const totalNumbers = siblingCount * 2 + 3
  const totalBlocks = totalNumbers + 2

  if (totalPages <= totalBlocks) {
    return generateRange(1, totalPages)
  }

  const leftSiblingIndex = Math.max(page - siblingCount, 1)
  const rightSiblingIndex = Math.min(page + siblingCount, totalPages)

  const showLeftDots = leftSiblingIndex > 2
  const showRightDots = rightSiblingIndex < totalPages - 2

  if (!showLeftDots && showRightDots) {
    const leftItemCount = 3 + 2 * siblingCount
    return [...generateRange(1, leftItemCount), "right-ellipsis", totalPages]
  }

  if (showLeftDots && !showRightDots) {
    const rightItemCount = 3 + 2 * siblingCount
    return [1, "left-ellipsis", ...generateRange(totalPages - rightItemCount + 1, totalPages)]
  }

  return [1, "left-ellipsis", ...generateRange(leftSiblingIndex, rightSiblingIndex), "right-ellipsis", totalPages]
}

const Pagination = React.forwardRef<HTMLElement, PaginationProps>(
  ({ className, page, total, pageSize = 10, onChange, siblingCount = 1, ...props }, ref) => {
    const totalPages = Math.ceil(total / pageSize)
    const range = usePaginationRange({ page, total, pageSize, siblingCount })

    if (totalPages <= 1) return null

    return (
      <nav
        ref={ref}
        role="navigation"
        aria-label="Pagination"
        className={cn("flex items-center gap-1", className)}
        {...props}
      >
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">上一页</span>
        </Button>

        {range.map((item, idx) => {
          if (item === "left-ellipsis" || item === "right-ellipsis") {
            return (
              <span
                key={item}
                className="flex h-8 w-8 items-center justify-center text-muted-foreground"
              >
                <MoreHorizontal className="h-4 w-4" />
              </span>
            )
          }

          const pageNum = item as number
          return (
            <Button
              key={idx}
              variant={page === pageNum ? "default" : "outline"}
              size="icon"
              className="h-8 w-8"
              onClick={() => onChange(pageNum)}
            >
              {pageNum}
            </Button>
          )
        })}

        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          disabled={page >= totalPages}
          onClick={() => onChange(page + 1)}
        >
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">下一页</span>
        </Button>
      </nav>
    )
  }
)
Pagination.displayName = "Pagination"

export { Pagination }
