"use client"
import Image from "next/image"
import { useState } from "react"
import { cn, optimizeImageUrl } from "@/lib/utils"
import { Car } from "lucide-react"

interface VoltaImageProps {
  src: string | null | undefined
  alt: string
  fill?: boolean
  width?: number
  height?: number
  className?: string
  priority?: boolean
  objectFit?: "cover" | "contain"
  unoptimized?: boolean
  sizes?: string
  fetchPriority?: "high" | "low" | "auto"
  quality?: number
}

export function VoltaImage({ 
  src, 
  alt, 
  fill, 
  width,
  height,
  className,
  priority = false,
  objectFit = "cover",
  unoptimized = false,
  sizes,
  fetchPriority,
  quality = 80
}: VoltaImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError,  setHasError]  = useState(false)

  const optimizedSrc = optimizeImageUrl(src, width || (fill ? 1920 : 800), quality);
  const showFallback = hasError || !optimizedSrc;

  return (
    <div className={cn(
      "relative overflow-hidden bg-muted",
      fill ? "h-full w-full" : "",
    )}
    style={(!fill && width && height) ? { width, height, minWidth: width, minHeight: height } : undefined}
    >
      {/* Shimmer skeleton while loading - Disabled for priority images to improve LCP */}
      {isLoading && !priority && !showFallback && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-muted">
          <div className="h-full w-full bg-gradient-to-r 
                          from-muted via-muted-foreground/10 to-muted
                          animate-[shimmer_1.5s_infinite]
                          bg-[length:200%_100%] absolute inset-0" />
          
          {/* Subtle icon while loading */}
          <Car className="w-8 h-8 text-muted-foreground/20 animate-pulse relative z-20" />
        </div>
      )}

      {/* Fallback UI when image fails or is missing */}
      {showFallback ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/80 z-20">
          <Car className="w-10 h-10 text-muted-foreground/40 mb-2" />
          <span className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest">Image Offline</span>
        </div>
      ) : (
        <Image
          src={optimizedSrc as string}
          alt={alt}
          fill={fill}
          width={!fill ? width : undefined}
          height={!fill ? height : undefined}
          priority={priority}
          unoptimized={unoptimized}
          sizes={sizes}
          {...(fetchPriority ? { fetchPriority } : {})}
          className={cn(
            "transition-opacity duration-500",
            objectFit === "cover" ? "object-cover" : "object-contain",
            isLoading && !priority ? "opacity-0" : "opacity-100",
            className
          )}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setHasError(true)
            setIsLoading(false)
          }}
        />
      )}
    </div>
  )
}
