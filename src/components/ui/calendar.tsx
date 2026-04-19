"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker> & {
  onClear?: () => void;
  onToday?: () => void;
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  onClear,
  onToday,
  ...props
}: CalendarProps) {
  return (
    <div className={cn("p-4 bg-white rounded-xl shadow-lg border border-border", className)}>
      <DayPicker
        showOutsideDays={showOutsideDays}
        className="w-full"
        classNames={{
          months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
          month: "space-y-4",
          caption: "flex justify-center pt-1 relative items-center mb-2",
          caption_label: "text-sm font-bold",
          nav: "space-x-1 flex items-center",
          nav_button: cn(
            buttonVariants({ variant: "outline" }),
            "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
          ),
          nav_button_previous: "absolute left-1",
          nav_button_next: "absolute right-1",
          table: "w-full border-collapse space-y-1",
          head_row: "flex",
          head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem] uppercase",
          row: "flex w-full mt-2",
          cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
          day: cn(
            buttonVariants({ variant: "ghost" }),
            "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-primary/10 transition-all rounded-lg"
          ),
          day_range_end: "day-range-end",
          day_selected:
            "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground font-bold",
          day_today: "bg-accent text-accent-foreground font-bold border border-primary/20",
          day_outside:
            "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
          day_disabled: "text-muted-foreground opacity-50",
          day_range_middle:
            "aria-selected:bg-accent aria-selected:text-accent-foreground",
          day_hidden: "invisible",
          ...classNames,
        }}
        components={{
          IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" />,
          IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" />,
        }}
        {...props}
      />
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border px-1">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            onClear?.();
          }}
          className="text-xs font-bold uppercase tracking-widest text-primary hover:underline transition-all"
        >
          Clear Selection
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            onToday?.();
          }}
          className="text-xs font-bold uppercase tracking-widest text-primary hover:underline transition-all"
        >
          Go to Today
        </button>
      </div>
    </div>
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
