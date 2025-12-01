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
    <div className="relative group p-[2px] rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 shadow-xl">
      <div className="bg-white dark:bg-[#161B22] rounded-2xl p-3">
        <DayPicker
          showOutsideDays={showOutsideDays}
          className={cn("p-1", className)}
          classNames={{
            months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
            month: "space-y-4",
            caption: "flex justify-center pt-1 relative items-center mb-2",
            caption_label: "text-lg font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent",
            nav: "space-x-1 flex items-center",
            nav_button: cn(
              buttonVariants({ variant: "outline" }),
              "h-8 w-8 bg-transparent p-0 opacity-50 hover:opacity-100 border-2 border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-xl transition-all hover:scale-110 hover:border-blue-200"
            ),
            nav_button_previous: "absolute left-1",
            nav_button_next: "absolute right-1",
            table: "w-full border-collapse space-y-1",
            head_row: "flex mb-2",
            head_cell:
              "text-gray-400 rounded-md w-10 font-bold text-[0.8rem] uppercase tracking-wider",
            row: "flex w-full mt-2 gap-1",
            cell: "h-10 w-10 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
            day: cn(
              buttonVariants({ variant: "ghost" }),
              "h-10 w-10 p-0 font-bold aria-selected:opacity-100 rounded-xl border-2 border-transparent hover:border-blue-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all hover:scale-110 hover:shadow-md text-gray-700 dark:text-gray-300"
            ),
            day_range_end: "day-range-end",
            day_selected:
              "bg-gradient-to-br from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 hover:text-white focus:bg-primary focus:text-primary-foreground shadow-lg shadow-blue-500/30 border-0 transform scale-105",
            day_today: "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700",
            day_outside:
              "day-outside text-gray-300 opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground",
            day_disabled: "text-muted-foreground opacity-50",
            day_range_middle:
              "aria-selected:bg-accent aria-selected:text-accent-foreground",
            day_hidden: "invisible",
            ...classNames,
          }}
          components={{
            IconLeft: ({ className, ...props }) => (
              <ChevronLeft className={cn("h-5 w-5 text-gray-600", className)} {...props} />
            ),
            IconRight: ({ className, ...props }) => (
              <ChevronRight className={cn("h-5 w-5 text-gray-600", className)} {...props} />
            ),
          }}
          {...props}
        />
      </div>
    </div>
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
