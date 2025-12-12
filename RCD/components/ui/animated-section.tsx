"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

interface AnimatedSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  delay?: number
  once?: boolean
  amount?: number
  className?: string
}

export function AnimatedSection({
  children,
  delay = 0,
  once = true,
  amount = 0.2,
  className,
  style,
  ...props
}: AnimatedSectionProps) {
  const elementRef = React.useRef<HTMLDivElement | null>(null)
  const [isVisible, setIsVisible] = React.useState(false)

  React.useEffect(() => {
    const el = elementRef.current
    if (!el) return

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    if (mediaQuery.matches) {
      setIsVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (!entry) return

        if (entry.isIntersecting) {
          setIsVisible(true)
          if (once) observer.disconnect()
        } else if (!once) {
          setIsVisible(false)
        }
      },
      {
        threshold: amount,
        rootMargin: "0px 0px -10% 0px",
      }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [amount, once])

  return (
    <div
      ref={elementRef}
      className={cn(
        "will-change-transform transition-[transform,opacity,filter] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none",
        isVisible
          ? "opacity-100 translate-y-0 scale-100 blur-0"
          : "opacity-0 translate-y-10 scale-[0.98] blur-[2px]",
        className
      )}
      style={{
        ...style,
        transitionDelay: `${delay}ms`,
      }}
      {...props}
    >
      {children}
    </div>
  )
}
