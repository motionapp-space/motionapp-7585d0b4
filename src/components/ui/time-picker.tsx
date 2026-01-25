import * as React from "react";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// Generate time options in 15-minute intervals (more practical for bookings)
const generateTimeOptions = (): string[] => {
  const times: string[] = [];
  for (let h = 6; h < 22; h++) { // 06:00 to 21:45 (practical business hours)
    for (let m = 0; m < 60; m += 15) {
      const hour = h.toString().padStart(2, "0");
      const minute = m.toString().padStart(2, "0");
      times.push(`${hour}:${minute}`);
    }
  }
  return times;
};

const TIME_OPTIONS = generateTimeOptions();

interface TimePickerProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function TimePicker({
  value,
  onChange,
  disabled,
  placeholder = "Seleziona orario",
}: TimePickerProps) {
  const [open, setOpen] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const handleTimeSelect = (time: string) => {
    onChange(time);
    setOpen(false);
  };

  // Format value to display (remove seconds if present)
  const displayValue = value ? value.substring(0, 5) : "";

  // Scroll to selected time when popover opens
  React.useEffect(() => {
    if (open && scrollRef.current && displayValue) {
      const selectedIndex = TIME_OPTIONS.indexOf(displayValue);
      if (selectedIndex !== -1) {
        // Each item is ~40px height, scroll to center the selected item
        const scrollPosition = Math.max(0, selectedIndex * 40 - 120);
        scrollRef.current.scrollTop = scrollPosition;
      }
    }
  }, [open, displayValue]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground"
          )}
        >
          <Clock className="mr-2 h-4 w-4" />
          {displayValue || placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[160px] p-0 pointer-events-auto z-[100]" 
        align="start" 
        sideOffset={4}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div 
          ref={scrollRef}
          className="h-[280px] overflow-y-auto overscroll-contain touch-pan-y bg-popover border rounded-md shadow-md"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          <div className="p-1.5 space-y-0.5">
            {TIME_OPTIONS.map((time) => (
              <button
                key={time}
                type="button"
                className={cn(
                  "w-full py-2.5 px-3 rounded-md text-sm font-medium transition-colors",
                  "hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1",
                  time === displayValue 
                    ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                    : "text-foreground"
                )}
                onClick={() => handleTimeSelect(time)}
              >
                {time}
              </button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
