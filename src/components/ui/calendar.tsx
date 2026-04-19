"use client"

import * as React from "react"
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from "lucide-react"
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
    <div className={cn("p-3 bg-white rounded-lg shadow-sm border", className)}>
      <DayPicker
        showOutsideDays={showOutsideDays}
        className="w-full"
        classNames={{
          months: "flex flex-col space-y-4",
          month: "space-y-4",
          caption: "flex justify-between pt-1 relative items-center px-2 mb-4",
          caption_label: "text-sm font-bold flex items-center gap-1 cursor-default",
          nav: "flex items-center gap-1",
          nav_button: cn(
            buttonVariants({ variant: "ghost" }),
            "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 transition-opacity"
          ),
          nav_button_previous: "",
          nav_button_next: "",
          table: "w-full border-collapse",
          head_row: "flex w-full mb-2",
          head_cell: "text-muted-foreground w-9 font-medium text-[0.8rem] flex-1 text-center",
          row: "flex w-full mt-1",
          cell: cn(
            "relative h-9 w-9 text-center text-sm p-0 flex-1 flex items-center justify-center",
            "[&:has([aria-selected])]:bg-transparent"
          ),
          day: cn(
            buttonVariants({ variant: "ghost" }),
            "h-8 w-8 p-0 font-normal aria-selected:opacity-100 hover:bg-muted rounded-md transition-all"
          ),
          day_range_end: "day-range-end",
          day_selected:
            "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground font-bold shadow-sm",
          day_today: "text-primary font-bold border border-primary/30 bg-primary/5",
          day_outside: "text-muted-foreground/30 opacity-50",
          day_disabled: "text-muted-foreground opacity-50",
          day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
          day_hidden: "invisible",
          ...classNames,
        }}
        components={{
          IconLeft: ({ ...props }) => <ChevronUp className="h-4 w-4" />,
          IconRight: ({ ...props }) => <ChevronDown className="h-4 w-4" />,
        }}
        {...props}
      />
      
      <div className="flex items-center justify-between mt-4 pt-3 border-t px-2">
        <button 
          onClick={(e) => {
            e.preventDefault();
            onClear?.();
          }}
          className="text-sm font-medium text-blue-500 hover:text-blue-600 transition-colors"
        >
          Clear
        </button>
        <button 
          onClick={(e) => {
            e.preventDefault();
            onToday?.();
          }}
          className="text-sm font-medium text-blue-500 hover:text-blue-600 transition-colors"
        >
          Today
        </button>
      </div>
    </div>
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
