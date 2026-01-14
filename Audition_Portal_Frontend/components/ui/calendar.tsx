"use client"

import * as React from "react"
import Calendar from "react-calendar"
import { cn } from "@/lib/utils"

type MyCalendarProps = {
  value?: any
  onChange?: (value: any) => void
  className?: string
}

export function MyCalendar({ value, onChange, className }: MyCalendarProps) {
  return (
    <div className={cn("p-3", className)}>
      <Calendar
        value={value}
        onChange={onChange}
        prevLabel="‹"
        nextLabel="›"
      />
    </div>
  )
}
