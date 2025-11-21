"use client"

import { cn } from "@/lib/utils"

interface AnimatedSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  delay?: number
  className?: string
}

export function AnimatedSection({
  children,
  delay = 0,
  className,
  ...props
}: AnimatedSectionProps) {
  return (
    <div
      className={cn(
        "animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both",
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
      {...props}
    >
      {children}
    </div>
  )
}
