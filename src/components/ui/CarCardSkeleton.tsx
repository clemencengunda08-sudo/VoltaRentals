"use client"

export function CarCardSkeleton() {
  return (
    <div className="rounded-[2rem] bg-card border border-border 
                    overflow-hidden animate-pulse">
      {/* Image area */}
      <div className="aspect-[16/10] bg-muted relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r 
                        from-muted via-muted-foreground/8 to-muted
                        animate-[shimmer_1.8s_infinite]
                        bg-[length:200%_100%]" />
      </div>
      
      {/* Content area */}
      <div className="p-8 space-y-6">
        {/* Category badge */}
        <div className="h-5 w-16 bg-muted rounded-full" />
        
        {/* Car name */}
        <div className="space-y-3">
          <div className="h-6 w-3/4 bg-muted rounded-lg" />
          <div className="h-4 w-1/2 bg-muted rounded-lg" />
        </div>
        
        {/* Price + button row */}
        <div className="flex justify-between items-center pt-4 border-t border-border/50">
          <div className="h-8 w-28 bg-muted rounded-lg" />
          <div className="flex gap-2">
            <div className="h-10 w-12 bg-muted rounded-xl" />
            <div className="h-10 w-12 bg-primary/20 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  )
}
