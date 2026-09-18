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

    const deleteMutation = useMutation({
        mutationFn: deleteAvatar,

        onSuccess: (response) => {
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

    function handleRemoveAvatar() {
        deleteMutation.mutate();
    }

    return (
        <section
            className="
                overflow-hidden
                rounded-2xl
                border
                border-slate-200
                bg-white
                shadow-[0_4px_20px_rgba(15,23,42,0.035)]
                dark:border-zinc-800
                dark:bg-zinc-950
                dark:shadow-none
            "
        >
            <div
                className="
                    flex
                    items-center
                    gap-3
                    border-b
                    border-slate-100
                    px-5
                    py-4
                    sm:px-6
                    dark:border-zinc-800
                "
            >
                <div
                    className="
                        flex
                        h-9
                        w-9
                        items-center
                        justify-center
                        rounded-lg
                        bg-slate-50
                        text-slate-500
                        dark:bg-zinc-900
                        dark:text-zinc-400
                    "
                >
                    <HiOutlineCamera className="h-4 w-4" />
                </div>

                <div>
                    <h2
                        className="
                            text-sm
                            font-bold
                            text-slate-800
                            dark:text-zinc-200
                        "
                    >
                        Profile image
                    </h2>

                    <p
                        className="
                            mt-0.5
                            text-[10px]
                            text-slate-400
                            dark:text-zinc-600
                        "
                    >
                        Upload a profile image or use your default avatar.
                    </p>
                </div>
            </div>

            <div
                className="
                    flex
                    flex-col
                    gap-5
                    px-5
                    py-5
                    sm:flex-row
                    sm:items-center
                    sm:px-6
                    sm:py-6
                "
            >
                <UserAvatar
                    userId={user.id}
                    name={user.name}
                    avatarUrl={user.avatarUrl}
                    size="xl"
                />

                <div className="min-w-0 flex-1">
                    <p
                        className="
                            text-sm
                            font-semibold
                            text-slate-800
                            dark:text-zinc-200
                        "
                    >
                        {user.name}
                    </p>

                    <p
                        className="
                            mt-1
                            text-xs
                            text-slate-400
                            dark:text-zinc-500
                        "
                    >
                        JPG, PNG or WEBP · Maximum 2MB
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                        <button
                            type="button"
                            disabled={isProcessing}
                            onClick={() =>
                                inputRef.current?.click()
                            }
                            className="
                                inline-flex
                                items-center
                                gap-2
                                rounded-lg
                                bg-slate-900
                                px-4
                                py-2
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
                                    items-center
                                    gap-2
                                    rounded-lg
                                    border
                                    border-slate-200
                                    px-4
                                    py-2
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
                                "
                            >
                                <HiOutlineTrash className="h-4 w-4" />

                                {deleteMutation.isPending
                                    ? "Removing..."
                                    : "Remove"}
                            </button>
                        )}
                    </div>

                    <input
                        ref={inputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={handleFileChange}
                    />

                    {selectedFile && (
                        <p
                            className="
                                mt-2
                                text-[11px]
                                text-slate-400
                                dark:text-zinc-500
                            "
                        >
                            Selected: {selectedFile.name}
                        </p>
                    )}
                </div>
            </div>
        </section>
    );
}