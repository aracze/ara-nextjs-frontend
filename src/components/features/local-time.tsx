"use client";

import { useState, useEffect } from "react";

export function LocalTime({ timezone }: { timezone?: string | null }) {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      hour: "2-digit",
      minute: "2-digit",
      ...(timezone ? { timeZone: timezone } : {}),
    };

    const update = () => {
      try {
        setTime(new Date().toLocaleString("cs-CZ", options));
      } catch {
        // Fallback if timezone is invalid
        setTime(new Date().toLocaleString("cs-CZ", { weekday: "long", hour: "2-digit", minute: "2-digit" }));
      }
    };
    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, [timezone]);

  if (!time) return <span className="text-3xl font-light text-gray-800 tabular-nums mt-1 uppercase font-heading">&nbsp;</span>;

  return (
    <span className="text-3xl font-light text-gray-800 tabular-nums mt-1 uppercase font-heading">
      {time}
    </span>
  );
}
