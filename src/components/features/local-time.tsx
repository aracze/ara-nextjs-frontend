"use client";

import { useState, useEffect } from "react";

interface TimeData {
  day: string;
  time: string;
  offset: string;
}

export function LocalTime({
  timezone,
  className = "",
}: {
  timezone?: string | null;
  className?: string;
}) {
  const [data, setData] = useState<TimeData | null>(null);

  useEffect(() => {
    const update = () => {
      try {
        const now = new Date();
        const opts: Intl.DateTimeFormatOptions = timezone
          ? { timeZone: timezone }
          : {};

        const day = now
          .toLocaleDateString("cs-CZ", { weekday: "long", ...opts })
          .toUpperCase();
        const time = now.toLocaleTimeString("cs-CZ", {
          hour: "2-digit",
          minute: "2-digit",
          ...opts,
        });

        // Calculate offset from Prague time
        let offset = "";
        if (timezone) {
          const destinationOffset = getOffsetHours(timezone, now);
          const pragueOffset = getOffsetHours("Europe/Prague", now);
          const diffHours = destinationOffset - pragueOffset;
          const totalMinutes = Math.round(diffHours * 60);
          const sign = totalMinutes >= 0 ? "+" : "-";
          const absMinutes = Math.abs(totalMinutes);
          const hours = Math.floor(absMinutes / 60);
          const minutes = absMinutes % 60;
          const value = `${hours}${minutes ? `:${minutes.toString().padStart(2, "0")}` : ""}`;
          offset = `${sign}${value}H`;
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
    <div
      className={`flex items-baseline justify-center gap-2 py-1 ${className}`}
    >
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

function getOffsetHours(timeZone: string, date: Date): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    timeZoneName: "shortOffset",
    hour: "2-digit",
  }).formatToParts(date);

  const offsetName = parts.find((part) => part.type === "timeZoneName")?.value;
  if (!offsetName) return 0;

  const match = offsetName.match(/^GMT(?:([+-])(\d{1,2})(?::(\d{2}))?)?$/);
  if (!match) return 0;

  const sign = match[1] === "-" ? -1 : 1;
  const hours = Number(match[2] ?? 0);
  const minutes = Number(match[3] ?? 0);
  return sign * (hours + minutes / 60);
}
