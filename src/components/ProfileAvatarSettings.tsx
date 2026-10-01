import {
    type ChangeEvent,
    useRef,
    useState,
} from "react";

import {
    HiOutlineCamera,
    HiOutlineTrash,
    HiOutlineArrowUpTray,
} from "react-icons/hi2";

import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";

import UserAvatar from "./UserAvatar";

import {
    uploadAvatar,
    deleteAvatar,
} from "../services/profile";

import type { User } from "../services/auth";

type ProfileAvatarSettingsProps = {
    user: User;
    onUserUpdated: (user: User) => void;
};

export default function ProfileAvatarSettings({
    user,
    onUserUpdated,
}: ProfileAvatarSettingsProps) {
    const inputRef =
        useRef<HTMLInputElement | null>(null);

    const [selectedFile, setSelectedFile] =
        useState<File | null>(null);

    /* ================================================================
       UPLOAD AVATAR
    ================================================================ */

    const uploadMutation = useMutation({
        mutationFn: uploadAvatar,

        onSuccess: (response) => {
            onUserUpdated({
                ...user,
                avatarUrl:
                    response.data.avatarUrl,
            });

            setSelectedFile(null);

            toast.success(
                "Profile image updated successfully."
            );
        },

        onError: (error: any) => {
            toast.error(
                error?.response?.data?.message ||
                "Unable to upload profile image."
            );
        },
    });

    /* ================================================================
       DELETE AVATAR
    ================================================================ */

    const deleteMutation = useMutation({
        mutationFn: deleteAvatar,

        onSuccess: () => {
            onUserUpdated({
                ...user,
                avatarUrl: null,
            });

            toast.success(
                "Profile image removed successfully."
            );
        },

        onError: (error: any) => {
            toast.error(
                error?.response?.data?.message ||
                "Unable to remove profile image."
            );
        },
    });

    const isProcessing =
        uploadMutation.isPending ||
        deleteMutation.isPending;

    /* ================================================================
       FILE CHANGE
    ================================================================ */

    function handleFileChange(
        event: ChangeEvent<HTMLInputElement>
    ) {
        const file =
            event.target.files?.[0];

        if (!file) {
            return;
        }

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
        ];

        if (!allowedTypes.includes(file.type)) {
            toast.error(
                "Only JPG, PNG and WEBP images are allowed."
            );

            event.target.value = "";
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            toast.error(
                "Image size must be less than 2MB."
            );

            event.target.value = "";
            return;
        }

        setSelectedFile(file);

        uploadMutation.mutate(file);

        event.target.value = "";
    }

    /* ================================================================
       REMOVE AVATAR
    ================================================================ */

    function handleRemoveAvatar() {
        deleteMutation.mutate();
    }

    return (
        <div
            className="
                flex
                w-full
                min-w-0
                flex-col
                gap-5
                sm:flex-row
                sm:items-center
            "
        >
            {/* ==================================================
                AVATAR
            ================================================== */}

            <div
                className="
                    flex
                    shrink-0
                    justify-center
                    sm:justify-start
                "
            >
                <div className="relative">
                    <UserAvatar
                        name={user.name}
                        avatarUrl={user.avatarUrl}
                        size="xl"
                    />

                    {isProcessing && (
                        <div
                            className="
                                absolute
                                inset-0
                                flex
                                items-center
                                justify-center
                                rounded-full
                                bg-white/70
                                dark:bg-zinc-950/70
                            "
                        >
                            <div
                                className="
                                    h-5
                                    w-5
                                    animate-spin
                                    rounded-full
                                    border-2
                                    border-slate-300
                                    border-t-slate-700
                                    dark:border-zinc-700
                                    dark:border-t-zinc-200
                                "
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* ==================================================
                IMAGE DETAILS
            ================================================== */}

            <div
                className="
                    min-w-0
                    flex-1
                    text-center
                    sm:text-left
                "
            >
                <div
                    className="
                        flex
                        items-center
                        justify-center
                        gap-2
                        sm:justify-start
                    "
                >
                    <HiOutlineCamera
                        className="
                            h-4
                            w-4
                            shrink-0
                            text-slate-400
                            dark:text-zinc-600
                        "
                    />

                    <span
                        className="
                            text-xs
                            font-semibold
                            text-slate-700
                            dark:text-zinc-300
                        "
                    >
                        Profile image
                    </span>
                </div>

                <p
                    className="
                        mt-1
                        truncate
                        text-sm
                        font-semibold
                        text-slate-900
                        dark:text-zinc-100
                    "
                >
                    {user.name}
                </p>

                <p
                    className="
                        mt-1
                        text-[11px]
                        leading-4
                        text-slate-400
                        dark:text-zinc-500
                    "
                >
                    JPG, PNG or WEBP · Maximum 2MB
                </p>

                {/* ==================================================
                    ACTIONS
                ================================================== */}

                <div
                    className="
                        mt-4
                        flex
                        flex-col
                        gap-2
                        sm:flex-row
                        sm:flex-wrap
                    "
                >
                    <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() =>
                            inputRef.current?.click()
                        }
                        className="
                            inline-flex
                            h-9
                            items-center
                            justify-center
                            gap-2
                            rounded-lg
                            bg-slate-900
                            px-4
                            text-xs
                            font-semibold
                            text-white
                            transition
                            hover:bg-slate-700
                            disabled:cursor-not-allowed
                            disabled:opacity-50
                            dark:bg-zinc-100
                            dark:text-zinc-900
                            dark:hover:bg-zinc-300
                            sm:w-auto
                        "
                    >
                        <HiOutlineArrowUpTray className="h-4 w-4" />

                        {uploadMutation.isPending
                            ? "Uploading..."
                            : "Upload image"}
                    </button>

                    {user.avatarUrl && (
                        <button
                            type="button"
                            disabled={isProcessing}
                            onClick={
                                handleRemoveAvatar
                            }
                            className="
                                inline-flex
                                h-9
                                items-center
                                justify-center
                                gap-2
                                rounded-lg
                                border
                                border-slate-200
                                px-4
                                text-xs
                                font-semibold
                                text-slate-600
                                transition
                                hover:bg-slate-50
                                disabled:cursor-not-allowed
                                disabled:opacity-50
                                dark:border-zinc-800
                                dark:text-zinc-300
                                dark:hover:bg-zinc-900
                                sm:w-auto
                            "
                        >
                            <HiOutlineTrash className="h-4 w-4" />

                            {deleteMutation.isPending
                                ? "Removing..."
                                : "Remove"}
                        </button>
                    )}
                </div>

                {/* ==================================================
                    FILE NAME
                ================================================== */}

                {selectedFile && (
                    <p
                        className="
                            mt-2
                            truncate
                            text-[10px]
                            text-slate-400
                            dark:text-zinc-500
                        "
                    >
                        Selected: {selectedFile.name}
                    </p>
                )}

                <input
                    ref={inputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleFileChange}
                />
            </div>
        </div>
    );
}