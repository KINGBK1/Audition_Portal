"use client"

import { useCallback, useState } from "react"
import { ToastProps } from "@/components/ui/toast"

export function useToast() {
  const [toasts, setToasts] = useState<ToastProps[]>([])

  const toast = useCallback((toast: ToastProps) => {
    setToasts((prev) => [...prev, toast])
  }, [])

  return {
    toast,
    toasts,
    dismiss: (id?: string) =>
      setToasts((prev) => prev.filter((t) => t.id !== id)),
  }
}
