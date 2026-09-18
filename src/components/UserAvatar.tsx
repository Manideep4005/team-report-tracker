import { useMemo, useState } from "react";

type UserAvatarProps = {
    userId?: string | null;
    name?: string | null;
    avatarUrl?: string | null;
    size?: "xs" | "sm" | "md" | "lg" | "xl";
    className?: string;
};

const sizeClasses = {
    xs: "h-6 w-6 text-[10px]",
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
    xl: "h-20 w-20 text-2xl",
};

function getInitials(
    name?: string | null
) {
    if (!name?.trim()) {
        return "U";
    }

    return name
        .trim()
        .split(/\s+/)
        .map((part) => part.charAt(0))
        .join("")
        .slice(0, 2)
        .toUpperCase();
}

export default function UserAvatar({
    userId,
    name,
    avatarUrl,
    size = "md",
    className = "",
}: UserAvatarProps) {
    const [imageFailed, setImageFailed] =
        useState(false);

    const seed = useMemo(() => {
        return userId || name || "user";
    }, [userId, name]);

    const defaultAvatarUrl =
        `https://api.dicebear.com/9.x/identicon/svg?seed=${encodeURIComponent(
            seed
        )}`;

    const imageUrl =
        avatarUrl && !imageFailed
            ? avatarUrl
            : defaultAvatarUrl;

    return (
        <div
            className={[
                "relative shrink-0 overflow-hidden rounded-full",
                "bg-slate-200 dark:bg-zinc-800",
                sizeClasses[size],
                className,
            ].join(" ")}
        >
            <img
                src={imageUrl}
                alt={`${name || "User"} avatar`}
                className="h-full w-full object-cover"
                loading="lazy"
                onError={() => {
                    if (avatarUrl && !imageFailed) {
                        setImageFailed(true);
                    }
                }}
            />

            {imageFailed && (
                <span
                    className="
                        absolute inset-0
                        flex items-center justify-center
                        font-semibold
                        text-slate-700
                        dark:text-zinc-200
                    "
                >
                    {getInitials(name)}
                </span>
            )}
        </div>
    );
}