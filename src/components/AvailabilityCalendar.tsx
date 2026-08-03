"use client";

import { useMemo, useState } from "react";

interface AvailabilityCalendarProps {
  /** "yyyy-mm-dd" — primeira data que pode ser selecionada. */
  minDate: string;
  /** Datas ocupadas, no formato "yyyy-mm-dd". */
  busyDates: Set<string>;
  selectedDate: string;
  onSelect: (date: string) => void;
}

const WEEKDAY_LABELS = ["D", "S", "T", "Q", "Q", "S", "S"];
const MONTH_LABELS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function toDateKey(year: number, month: number, day: number): string {
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

const MAX_MONTHS_AHEAD = 12;

export default function AvailabilityCalendar({
  minDate,
  busyDates,
  selectedDate,
  onSelect,
}: AvailabilityCalendarProps) {
  const [minYear, minMonth] = minDate.split("-").map(Number);
  const firstAllowedMonthIndex = minYear * 12 + (minMonth - 1);

  const [viewMonthIndex, setViewMonthIndex] = useState(firstAllowedMonthIndex);

  const viewYear = Math.floor(viewMonthIndex / 12);
  const viewMonth = viewMonthIndex % 12;

  const weeks = useMemo(() => {
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const firstWeekday = new Date(viewYear, viewMonth, 1).getDay();

    const cells: (number | null)[] = Array(firstWeekday).fill(null);
    for (let day = 1; day <= daysInMonth; day++) cells.push(day);
    while (cells.length % 7 !== 0) cells.push(null);

    const result: (number | null)[][] = [];
    for (let i = 0; i < cells.length; i += 7) result.push(cells.slice(i, i + 7));
    return result;
  }, [viewYear, viewMonth]);

  const canGoBack = viewMonthIndex > firstAllowedMonthIndex;
  const canGoForward = viewMonthIndex < firstAllowedMonthIndex + MAX_MONTHS_AHEAD;

  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          disabled={!canGoBack}
          onClick={() => setViewMonthIndex((m) => m - 1)}
          aria-label="Mês anterior"
          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-muted disabled:opacity-30 disabled:hover:bg-transparent"
        >
          ‹
        </button>
        <p className="text-sm font-medium">
          {MONTH_LABELS[viewMonth]} {viewYear}
        </p>
        <button
          type="button"
          disabled={!canGoForward}
          onClick={() => setViewMonthIndex((m) => m + 1)}
          aria-label="Próximo mês"
          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-muted disabled:opacity-30 disabled:hover:bg-transparent"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground mb-1">
        {WEEKDAY_LABELS.map((label, i) => (
          <div key={i}>{label}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {weeks.flatMap((week, weekIndex) =>
          week.map((day, dayIndex) => {
            if (day === null) return <div key={`${weekIndex}-${dayIndex}`} />;

            const dateKey = toDateKey(viewYear, viewMonth, day);
            const isBusy = busyDates.has(dateKey);
            const isBeforeMin = dateKey < minDate;
            const isSelected = dateKey === selectedDate;
            const isDisabled = isBusy || isBeforeMin;

            return (
              <button
                key={dateKey}
                type="button"
                disabled={isDisabled}
                title={isBusy ? "Já ocupado" : undefined}
                onClick={() => onSelect(dateKey)}
                className={[
                  "h-9 rounded-md text-sm transition-colors",
                  isSelected
                    ? "bg-primary text-primary-foreground font-medium"
                    : isBusy
                      ? "text-muted-foreground/50 line-through cursor-not-allowed"
                      : isBeforeMin
                        ? "text-muted-foreground/30 cursor-not-allowed"
                        : "hover:bg-surface-muted",
                ].join(" ")}
              >
                {day}
              </button>
            );
          }),
        )}
      </div>

      <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-primary" /> Selecionado
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-muted-foreground/40" /> Ocupado
        </span>
      </div>
    </div>
  );
}
