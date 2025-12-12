"use client"

import { usePathname } from "next/navigation"

interface LayoutWrapperProps {
  children: React.ReactNode
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname()
  
  // Pages where we want a full-screen layout (no navbar/footer padding interference)
  const isFullScreenPage = pathname === "/"
  
  return (
    <div className={`flex min-h-screen flex-col ${isFullScreenPage ? "" : ""}`}>
      {children}
    </div>
  )
}
