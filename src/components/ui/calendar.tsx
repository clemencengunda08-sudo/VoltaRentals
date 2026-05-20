"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-4 bg-card border border-border rounded-2xl shadow-xl", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        month_caption: "flex justify-center pt-2 relative items-center h-10",
        caption_label: "text-xs font-black uppercase tracking-[0.2em] text-foreground",
        nav: "space-x-1 flex items-center",
        button_previous: cn(
          buttonVariants({ variant: "outline" }),
          "h-8 w-8 bg-muted border-none p-0 opacity-50 hover:opacity-100 hover:bg-primary hover:text-white rounded-lg transition-all absolute left-2 top-2 z-10"
        ),
        button_next: cn(
          buttonVariants({ variant: "outline" }),
          "h-8 w-8 bg-muted border-none p-0 opacity-50 hover:opacity-100 hover:bg-primary hover:text-white rounded-lg transition-all absolute right-2 top-2 z-10"
        ),
        month_grid: "w-full border-collapse space-y-1",
        weekdays: "flex justify-between w-full mt-4",
        weekday: "text-muted-foreground/60 w-9 font-black text-[9px] uppercase tracking-widest text-center",
        week: "flex w-full mt-2 justify-between gap-1",
        day: "h-9 w-9 text-center text-[10px] font-bold p-0 relative focus-within:relative focus-within:z-20",
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-bold uppercase tracking-tighter rounded-xl hover:bg-primary/10 transition-colors text-foreground"
        ),
        selected: "bg-primary text-white hover:bg-primary hover:text-white focus:bg-primary focus:text-white shadow-lg shadow-primary/20 scale-110 z-30",
        today: "bg-secondary/10 text-secondary border border-secondary/20",
        outside: "day-outside text-muted-foreground/30 opacity-50",
        disabled: "text-muted-foreground/20 opacity-30 pointer-events-none",
        range_middle: "aria-selected:bg-primary/10 aria-selected:text-primary font-black",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ ...props }) => {
          if (props.orientation === "left") {
            return <ChevronLeft className="h-4 w-4 text-foreground" />
          }
          return <ChevronRight className="h-4 w-4 text-foreground" />
        },
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
