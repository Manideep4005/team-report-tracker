import {
    useEffect,
    useState,
    type ButtonHTMLAttributes,
    type CSSProperties,
    type ReactNode,
} from "react";

/* ================================================================
  LIQUID GLASS (Apple-style)
  Shared by Sidebar + Header.

  Ingredients:
   1. Translucent body with a soft gradient (not a flat fill)
   2. Strong backdrop blur + saturation so what is behind refracts
   3. Gradient rim: bright on the top-left edge, tinted on the
      bottom-right edge, like light bending around real glass
   4. Soft inner glow + coloured outer shadow so it is visible on
      BOTH light and dark backgrounds
   5. A light sweep that only plays on hover / reveal, so there is
      never a static white blob sitting inside the glass
================================================================ */

const cx = (...classes: Array<string | false | null | undefined>) =>
    classes.filter(Boolean).join(" ");

const SPRING = "cubic-bezier(0.34, 1.56, 0.64, 1)";

/* gradient-border trick: paint a gradient, then mask out the middle */
const rimMask: CSSProperties = {
    padding: 1,
    WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
    WebkitMaskComposite: "xor",
    maskComposite: "exclude",
};

function Rim() {
    return (
        <>
            {/* light theme rim */}
            <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 rounded-[inherit] dark:hidden"
                style={{
                    ...rimMask,
                    background:
                        "linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0.2) 36%, rgba(99,102,241,0.12) 64%, rgba(99,102,241,0.5) 100%)",
                }}
            />
            {/* dark theme rim */}
            <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 hidden rounded-[inherit] dark:block"
                style={{
                    ...rimMask,
                    background:
                        "linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.07) 36%, rgba(255,255,255,0.04) 64%, rgba(165,180,252,0.55) 100%)",
                }}
            />
        </>
    );
}

/* shared surface classes (body + blur + shadows) */
const glassSurface =
    "backdrop-blur-[12px] backdrop-saturate-[1.8] backdrop-brightness-[1.04] " +
    /* light */
    "bg-[linear-gradient(135deg,rgba(255,255,255,0.78),rgba(224,231,255,0.34))] " +
    "shadow-[0_10px_26px_-8px_rgba(79,70,229,0.38),0_2px_6px_rgba(15,23,42,0.08),inset_0_0_16px_rgba(255,255,255,0.6)] " +
    /* dark */
    "dark:bg-[linear-gradient(135deg,rgba(255,255,255,0.17),rgba(255,255,255,0.045))] " +
    "dark:shadow-[0_10px_26px_-8px_rgba(129,140,248,0.45),0_2px_6px_rgba(0,0,0,0.45),inset_0_0_16px_rgba(255,255,255,0.07)]";

/* ================================================================
  GLASS ICON BUTTON
================================================================ */

interface GlassIconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    size?: number;
    children: ReactNode;
}

export function GlassIconButton({
    size = 40,
    children,
    className,
    ...rest
}: GlassIconButtonProps) {
    return (
        <span
            className="relative inline-flex shrink-0"
            style={{ width: size, height: size }}
        >
            {/* iridescent glow the glass refracts */}
            <span
                aria-hidden="true"
                className={cx(
                    "pointer-events-none absolute -inset-1 rounded-full blur-[10px] animate-pulse motion-reduce:animate-none",
                    "bg-gradient-to-br from-indigo-400/50 via-sky-300/40 to-violet-400/50",
                    "dark:from-indigo-400/35 dark:via-sky-400/20 dark:to-violet-500/35",
                )}
            />

            <button
                type="button"
                {...rest}
                className={cx(
                    "group relative flex h-full w-full items-center justify-center overflow-hidden rounded-full",
                    "text-indigo-600 dark:text-indigo-100",
                    glassSurface,
                    "transition-all duration-300 ease-out hover:scale-110 active:scale-95",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60",
                    className,
                )}
            >
                <Rim />

                {/* light sweep — only visible while hovering */}
                <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 -translate-x-[130%] transition-transform duration-700 ease-out group-hover:translate-x-[130%]"
                    style={{
                        background:
                            "linear-gradient(115deg, transparent 32%, rgba(255,255,255,0.65) 50%, transparent 68%)",
                    }}
                />

                <span className="relative z-10 flex items-center justify-center">
                    {children}
                </span>
            </button>
        </span>
    );
}

/* ================================================================
  GLASS TOOLTIP
  A glass squircle that "pours" out of a small glass droplet,
  with a springy scale-in and a one-time light sweep.
================================================================ */

export function GlassTooltip({
    label,
    top,
    left,
}: {
    label: string;
    top: number;
    left: number;
}) {
    const [shown, setShown] = useState(false);

    useEffect(() => {
        const id = requestAnimationFrame(() => setShown(true));
        return () => cancelAnimationFrame(id);
    }, []);

    return (
        <div
            role="tooltip"
            className="pointer-events-none fixed z-[1000] -translate-y-1/2"
            style={{ top, left }}
        >
            <div className="relative">
                {/* droplet that connects the tooltip to the nav item */}
                <span
                    aria-hidden="true"
                    className={cx(
                        "absolute -left-[11px] top-1/2 h-[7px] w-[7px] -translate-y-1/2 rounded-full",
                        "bg-[linear-gradient(135deg,rgba(255,255,255,0.95),rgba(165,180,252,0.6))]",
                        "shadow-[0_2px_6px_rgba(79,70,229,0.35),inset_0_0_2px_rgba(255,255,255,0.9)]",
                        "dark:bg-[linear-gradient(135deg,rgba(255,255,255,0.55),rgba(129,140,248,0.35))]",
                        "dark:shadow-[0_2px_8px_rgba(129,140,248,0.5),inset_0_0_2px_rgba(255,255,255,0.5)]",
                    )}
                    style={{
                        transform: `translateY(-50%) scale(${shown ? 1 : 0})`,
                        opacity: shown ? 1 : 0,
                        transition: `transform 360ms ${SPRING}, opacity 200ms ease-out`,
                    }}
                />

                {/* pill */}
                <div
                    className={cx(
                        "relative origin-left overflow-hidden whitespace-nowrap rounded-[18px] px-4 py-2",
                        "text-[12px] font-semibold tracking-[-0.01em] text-[var(--text-primary)]",
                        glassSurface,
                    )}
                    style={{
                        transform: shown
                            ? "translateX(0) scale(1, 1)"
                            : "translateX(-12px) scale(0.55, 0.75)",
                        opacity: shown ? 1 : 0,
                        transition: `transform 420ms ${SPRING}, opacity 220ms ease-out`,
                    }}
                >
                    <Rim />

                    {/* one-time light sweep as it appears */}
                    <span
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0"
                        style={{
                            background:
                                "linear-gradient(115deg, transparent 32%, rgba(255,255,255,0.6) 50%, transparent 68%)",
                            transform: shown ? "translateX(130%)" : "translateX(-130%)",
                            transition: shown ? "transform 900ms ease-out 140ms" : "none",
                        }}
                    />

                    <span
                        className="relative z-10 block"
                        style={{
                            opacity: shown ? 1 : 0,
                            transform: shown ? "translateX(0)" : "translateX(-4px)",
                            transition: "opacity 240ms ease-out 80ms, transform 300ms ease-out 80ms",
                        }}
                    >
                        {label}
                    </span>
                </div>
            </div>
        </div>
    );
}