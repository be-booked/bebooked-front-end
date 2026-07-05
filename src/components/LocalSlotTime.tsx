"use client";

import { useSyncExternalStore } from "react";

interface Props {
  /** UTC date string: "2026-07-04" */
  utcDate: string;
  /** UTC time string: "18:00" */
  utcTime: string;
}

function formatLocal(utcDate: string, utcTime: string): string {
  const dt = new Date(`${utcDate}T${utcTime}Z`);
  const today    = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const isToday    = dt.toDateString() === today.toDateString();
  const isTomorrow = dt.toDateString() === tomorrow.toDateString();

  const day = isToday    ? "Today"
    : isTomorrow ? "Tomorrow"
    : dt.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

  const time = dt.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

  return `${day} \u00b7 ${time}`;
}

const subscribe = () => () => {};

/**
 * Renders a UTC slot datetime (date + time) as local time in the viewer's timezone.
 * useSyncExternalStore supplies a server snapshot (non-breaking space) for SSR/hydration
 * and the real local-timezone value on the client — no setState in an effect needed.
 */
export function LocalSlotTime({ utcDate, utcTime }: Props) {
  const text = useSyncExternalStore(
    subscribe,
    () => formatLocal(utcDate, utcTime),
    () => "\u00a0",
  );

  return <>{text}</>;
}
