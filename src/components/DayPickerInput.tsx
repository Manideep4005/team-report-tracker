import { useEffect, useRef, useState } from "react";
import { DayPicker } from "react-day-picker";
import { format, isSameDay } from "date-fns";
import "react-day-picker/dist/style.css";
import {
    HiOutlineCalendarDays,
    HiChevronLeft,
    HiChevronRight,
    HiOutlineChevronDown,
} from "react-icons/hi2";

interface DayPickerInputProps {
    value: Date | null;
    onChange: (date: Date) => void;
    placeholder?: string;
}

export default function DayPickerInput({
    value,
    onChange,
    placeholder = "Select date",
}: DayPickerInputProps) {
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const isToday = value ? isSameDay(value, new Date()) : false;

    return (
        <div className="relative" ref={containerRef}>
            <button
                onClick={() => setOpen((prev) => !prev)}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[13px] font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800/60"
            >
                <HiOutlineCalendarDays className="h-[15px] w-[15px] text-slate-400 dark:text-zinc-500" />
                <span
                    className={
                        value
                            ? "tabular-nums"
                            : "text-slate-400 dark:text-zinc-500"
                    }
                >
                    {value ? format(value, "dd MMM yyyy") : placeholder}
                </span>
                <HiOutlineChevronDown
                    className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-150 dark:text-zinc-500 ${open ? "rotate-180" : ""
                        }`}
                />
            </button>

            {open && (
                <div className="absolute right-0 z-[999] mt-1.5 w-[272px] rounded-xl border border-slate-200 bg-white p-2.5 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-4px_rgba(0,0,0,0.10)] dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-[0_1px_2px_rgba(0,0,0,0.2),0_8px_24px_-4px_rgba(0,0,0,0.4)]">
                    <DayPicker
                        mode="single"
                        selected={value ?? undefined}
                        disabled={{ after: new Date() }}
                        onSelect={(date) => {
                            if (!date) return;
                            onChange(date);
                            setOpen(false);
                        }}
                        modifiers={{ istoday: (d) => isSameDay(d, new Date()) }}
                        className="text-sm"
                        classNames={{
                            root: "text-slate-700 dark:text-zinc-300 w-full",
                            months: "flex w-full",
                            month: "w-full",
                            month_caption: "hidden",
                            caption_label: "hidden",
                            nav: "hidden",
                            month_grid: "mt-0 w-full border-collapse",
                            weekdays: "flex",
                            weekday:
                                "w-[34px] pb-1.5 text-center text-[10.5px] font-semibold uppercase tracking-wide text-slate-400 dark:text-zinc-500",
                            week: "flex w-full",
                            day: "relative flex h-[34px] w-[34px] items-center justify-center p-0",
                            day_button:
                                "relative flex h-[30px] w-[30px] items-center justify-center rounded-md text-[12.5px] font-medium tabular-nums text-slate-700 transition-colors duration-100 hover:bg-slate-100 dark:text-zinc-300 dark:hover:bg-zinc-800",
                            selected:
                                "[&>button]:!bg-slate-900 [&>button]:!text-white [&>button]:hover:!bg-slate-900 dark:[&>button]:!bg-zinc-100 dark:[&>button]:!text-zinc-900 dark:[&>button]:hover:!bg-zinc-100",
                            outside: "[&>button]:text-slate-300 dark:[&>button]:text-zinc-700",
                            disabled:
                                "[&>button]:cursor-not-allowed [&>button]:text-slate-300 [&>button]:opacity-40 [&>button]:hover:bg-transparent dark:[&>button]:text-zinc-700",
                        }}
                        components={{
                            MonthCaption: ({ calendarMonth }) => (
                                <div className="mb-1.5 flex items-center justify-between px-0.5">
                                    <NavButton
                                        direction="left"
                                        onClick={() =>
                                            document
                                                .querySelector<HTMLButtonElement>(
                                                    "[data-nav='prev']"
                                                )
                                                ?.click()
                                        }
                                    />
                                    <span className="text-[12.5px] font-semibold text-slate-800 dark:text-zinc-100">
                                        {format(calendarMonth.date, "MMMM yyyy")}
                                    </span>
                                    <NavButton
                                        direction="right"
                                        onClick={() =>
                                            document
                                                .querySelector<HTMLButtonElement>(
                                                    "[data-nav='next']"
                                                )
                                                ?.click()
                                        }
                                    />
                                </div>
                            ),
                            PreviousMonthButton: (props) => (
                                <button {...props} data-nav="prev" className="hidden" />
                            ),
                            NextMonthButton: (props) => (
                                <button {...props} data-nav="next" className="hidden" />
                            ),
                            DayButton: ({ day, modifiers, className, ...props }) => (
                                <button {...props} className={className}>
                                    {day.date.getDate()}
                                    {modifiers.istoday && !modifiers.selected && (
                                        <span className="absolute bottom-[3px] left-1/2 h-[3px] w-[3px] -translate-x-1/2 rounded-full bg-blue-500 dark:bg-blue-400" />
                                    )}
                                </button>
                            ),
                        }}
                    />

                    {value && !isToday && (
                        <div className="mt-1.5 flex justify-end border-t border-slate-100 pt-1.5 dark:border-zinc-800">
                            <button
                                onClick={() => {
                                    onChange(new Date());
                                    setOpen(false);
                                }}
                                className="rounded-md px-2 py-1 text-[11.5px] font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                            >
                                Today
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function NavButton({
    direction,
    onClick,
}: {
    direction: "left" | "right";
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="flex h-6 w-6 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
        >
            {direction === "left" ? (
                <HiChevronLeft className="h-3.5 w-3.5" />
            ) : (
                <HiChevronRight className="h-3.5 w-3.5" />
            )}
        </button>
    );
}