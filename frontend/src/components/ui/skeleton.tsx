import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

// Enhanced skeleton components for specific use cases
function SkeletonText({ 
  lines = 1, 
  className,
  ...props 
}: React.HTMLAttributes<HTMLDivElement> & { lines?: number }) {
  return (
    <div className={cn("space-y-2", className)} {...props}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton 
          key={index}
          className={cn(
            "h-4",
            index === lines - 1 && lines > 1 ? "w-3/4" : "w-full"
          )}
        />
      ))}
    </div>
  )
}

function SkeletonCard({ 
  className,
  showHeader = true,
  showContent = true,
  contentLines = 3,
  ...props 
}: React.HTMLAttributes<HTMLDivElement> & {
  showHeader?: boolean
  showContent?: boolean
  contentLines?: number
}) {
  return (
    <div className={cn("rounded-lg border bg-card p-6 space-y-4", className)} {...props}>
      {showHeader && (
        <div className="space-y-2">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      )}
      {showContent && (
        <div className="space-y-2">
          {Array.from({ length: contentLines }).map((_, index) => (
            <Skeleton 
              key={index}
              className={cn(
                "h-4",
                index === contentLines - 1 ? "w-3/4" : "w-full"
              )}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function SkeletonTable({ 
  rows = 5,
  columns = 4,
  className,
  ...props 
}: React.HTMLAttributes<HTMLDivElement> & {
  rows?: number
  columns?: number
}) {
  return (
    <div className={cn("space-y-4", className)} {...props}>
      {/* Table header */}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, index) => (
          <Skeleton key={`header-${index}`} className="h-6 w-full" />
        ))}
      </div>
      
      {/* Table rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div 
          key={`row-${rowIndex}`}
          className="grid gap-4" 
          style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={`cell-${rowIndex}-${colIndex}`} className="h-4 w-full" />
          ))}
        </div>
      ))}
    </div>
  )
}

function SkeletonChart({ 
  className,
  ...props 
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("space-y-4", className)} {...props}>
      {/* Chart title area */}
      <div className="space-y-2">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      
      {/* Chart area with animated bars */}
      <div className="relative h-64 bg-muted rounded-lg overflow-hidden">
        <div className="absolute inset-0 flex items-end justify-around p-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="bg-muted-foreground/20 rounded-t animate-pulse"
              style={{
                width: '12%',
                height: `${Math.random() * 80 + 20}%`,
                animationDelay: `${index * 0.1}s`,
              }}
            />
          ))}
        </div>
      </div>
      
      {/* Legend area */}
      <div className="flex justify-center space-x-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="flex items-center space-x-2">
            <Skeleton className="h-3 w-3 rounded-full" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  )
}

function SkeletonAvatar({ 
  className,
  size = "default",
  ...props 
}: React.HTMLAttributes<HTMLDivElement> & {
  size?: "sm" | "default" | "lg"
}) {
  const sizeClasses = {
    sm: "h-8 w-8",
    default: "h-10 w-10",
    lg: "h-12 w-12"
  }

  return (
    <Skeleton 
      className={cn("rounded-full", sizeClasses[size], className)} 
      {...props} 
    />
  )
}

function SkeletonButton({ 
  className,
  size = "default",
  ...props 
}: React.HTMLAttributes<HTMLDivElement> & {
  size?: "sm" | "default" | "lg"
}) {
  const sizeClasses = {
    sm: "h-8 w-20",
    default: "h-10 w-24",
    lg: "h-12 w-28"
  }

  return (
    <Skeleton 
      className={cn("rounded-md", sizeClasses[size], className)} 
      {...props} 
    />
  )
}

function SkeletonList({ 
  items = 5,
  showAvatar = false,
  className,
  ...props 
}: React.HTMLAttributes<HTMLDivElement> & {
  items?: number
  showAvatar?: boolean
}) {
  return (
    <div className={cn("space-y-4", className)} {...props}>
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="flex items-center space-x-4">
          {showAvatar && <SkeletonAvatar />}
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}

// Shimmer effect for enhanced loading experience
function SkeletonShimmer({ 
  className,
  ...props 
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div 
      className={cn(
        "relative overflow-hidden rounded-md bg-muted",
        "before:absolute before:inset-0",
        "before:-translate-x-full before:animate-[shimmer_2s_infinite]",
        "before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent",
        className
      )} 
      {...props} 
    />
  )
}

export { 
  Skeleton,
  SkeletonText,
  SkeletonCard,
  SkeletonTable,
  SkeletonChart,
  SkeletonAvatar,
  SkeletonButton,
  SkeletonList,
  SkeletonShimmer
}
