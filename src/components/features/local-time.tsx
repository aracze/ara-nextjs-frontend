"use client";

import { useState, useEffect } from "react";

interface TimeData {
  day: string;
  time: string;
  offset: string;
}

export function LocalTime({ timezone }: { timezone?: string | null }) {
  const [data, setData] = useState<TimeData | null>(null);

  useEffect(() => {
    const update = () => {
      try {
        const now = new Date();
        const opts: Intl.DateTimeFormatOptions = timezone ? { timeZone: timezone } : {};

        const day = now.toLocaleDateString("cs-CZ", { weekday: "long", ...opts }).toUpperCase();
        const time = now.toLocaleTimeString("cs-CZ", { hour: "2-digit", minute: "2-digit", ...opts });

        // Calculate offset from local time
        let offset = "";
        if (timezone) {
          const localMinutes = now.getHours() * 60 + now.getMinutes();
          const remoteStr = now.toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", timeZone: timezone });
          const [rh, rm] = remoteStr.split(":").map(Number);
          const remoteMinutes = rh * 60 + rm;
          const diffHours = Math.round((remoteMinutes - localMinutes) / 60);
          if (diffHours !== 0) {
            offset = `${diffHours > 0 ? "+" : ""}${diffHours}H`;
          } else {
            offset = "0H";
          }
        }

        setData({ day, time, offset });
      } catch {
        setData(null);
      }
    };
    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, [timezone]);

  if (!data) {
    return <div className="h-[42px]" />;
  }

  return (
    <div className="flex items-baseline justify-center gap-2 py-1">
      <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#67747c]">
        {data.day}
      </span>
      <span className="text-[26px] tracking-[0.01rem] text-[#333] px-2 tabular-nums">
        {data.time}
      </span>
      {data.offset && (
        <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#67747c]">
          {data.offset}
        </span>
      )}
    </div>
  );
}
