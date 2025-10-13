import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import { useState, useEffect } from "react";
import { DateRange } from "react-day-picker";

interface DateRangePickerProps {
  value?: DateRange | undefined;
  onDateChange?: (range: DateRange | undefined) => void;
}

export function DateRangePicker({ value, onDateChange }: DateRangePickerProps) {
  const [date, setDate] = useState<DateRange | undefined>(value);

  // Sync with external value changes
  useEffect(() => {
    setDate(value);
  }, [value]);

  const handleDateChange = (newDate: DateRange | undefined) => {
    setDate(newDate);
    onDateChange?.(newDate);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="justify-start text-left font-normal" data-testid="button-date-picker">
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date?.from ? (
            date.to ? (
              <>
                {format(date.from, "MMM dd, yyyy", { locale: enUS })} -{" "}
                {format(date.to, "MMM dd, yyyy", { locale: enUS })}
              </>
            ) : (
              format(date.from, "MMM dd, yyyy", { locale: enUS })
            )
          ) : (
            <span>Select date range</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          initialFocus
          mode="range"
          defaultMonth={new Date(2024, 0, 1)}
          selected={date}
          onSelect={handleDateChange}
          numberOfMonths={2}
          locale={enUS}
        />
      </PopoverContent>
    </Popover>
  );
}
