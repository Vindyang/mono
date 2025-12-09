"use client"

import * as React from "react"
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react"
import { DayButton, DayPicker, getDefaultClassNames, useDayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  formatters,
  components,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>["variant"]
}) {
  const defaultClassNames = getDefaultClassNames()

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-2", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-8 relative items-center w-full mb-8",
        caption_label: "text-sm font-medium w-full",
        nav: "hidden",
        table: "flex flex-col w-full space-y-1",
        head: "flex flex-col w-full",
        head_row: "flex w-full mb-2 border-b border-border pb-2",
        weekdays: "flex w-full border-b border-border pb-2 mb-2",
        weekday: "text-muted-foreground rounded-md flex-1 font-medium text-xs align-top",
        head_cell: "text-muted-foreground rounded-md flex-1 font-medium text-xs align-top border-b border-border pb-2",
        tbody: "flex flex-col w-full",
        week: "flex w-full mt-2",
        row: "flex w-full mt-2",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-8 w-8 text-sm p-0 font-normal aria-selected:opacity-100"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside:
          "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      formatters={formatters}
      components={{

        Nav: () => <></>,
        CaptionLabel: ({ ...props }) => {
            const { goToMonth, nextMonth, previousMonth, months } = useDayPicker()
            const date = months?.[0]?.date || new Date()
  
            return (
              <div className="flex justify-between items-center w-full pt-6 pb-4 border-b border-border mb-4">
                 <span className="text-xl font-medium truncate pl-2">{date.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
                 <div className="flex items-center gap-1 pr-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-6 w-6 bg-transparent p-0 opacity-50 hover:opacity-100"
                    onClick={() => previousMonth && goToMonth(previousMonth)}
                    disabled={!previousMonth}
                  >
                    <ChevronLeftIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-6 w-6 bg-transparent p-0 opacity-50 hover:opacity-100"
                    onClick={() => nextMonth && goToMonth(nextMonth)}
                    disabled={!nextMonth}
                  >
                    <ChevronRightIcon className="h-4 w-4" />
                  </Button>
                 </div>
              </div>
            )
        },
        ...components,
      }}
      {...props}
    />
  )
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  ...props
}: React.ComponentProps<typeof DayButton>) {
  const defaultClassNames = getDefaultClassNames()

  const ref = React.useRef<HTMLButtonElement>(null)
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus()
  }, [modifiers.focused])

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      data-day={day.date.toLocaleDateString()}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        "data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground data-[range-middle=true]:bg-accent data-[range-middle=true]:text-accent-foreground data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground group-data-[focused=true]/day:border-ring group-data-[focused=true]/day:ring-ring/50 dark:hover:text-accent-foreground flex aspect-square size-auto w-full min-w-[var(--cell-size)] flex-col gap-1 leading-none font-normal group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:ring-[3px] data-[range-end=true]:rounded-md data-[range-end=true]:rounded-r-md data-[range-middle=true]:rounded-none data-[range-start=true]:rounded-md data-[range-start=true]:rounded-l-md [&>span]:text-sm [&>span]:opacity-70",
        defaultClassNames.day,
        className
      )}
      {...props}
    />
  )
}

export { Calendar, CalendarDayButton }
