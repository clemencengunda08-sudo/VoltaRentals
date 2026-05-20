"use client";

import { RangeCalendar } from "@/components/ui/calendar-rac";
import { getLocalTimeZone, today } from "@internationalized/date";
import { useState } from "react";
import type { DateRange } from "react-aria-components";

function Component() {
  const now = today(getLocalTimeZone());
  const [date, setDate] = useState<any | null>({
    start: now,
    end: now.add({ days: 3 }),
  });

  return (
    <div>
      <RangeCalendar
        className="rounded-lg border border-border p-2 bg-background"
        value={date}
        onChange={setDate}
      />
      <p
        className="mt-4 text-center text-xs text-muted-foreground"
        role="region"
        aria-live="polite"
      >
        Range calendar -{" "}
        <a
          className="underline hover:text-foreground"
          href="https://react-spectrum.adobe.com/react-aria/DateRangePicker.html"
          target="_blank"
          rel="noopener nofollow"
        >
          React Aria
        </a>
      </p>
    </div>
  );
}

export { Component };
