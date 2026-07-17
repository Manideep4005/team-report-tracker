import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
    changePassword,
    getProfile,
    updateProfile,
} from "../../services/profile";
import { useAuth } from "../../context/AuthContext";

interface Profile {
    id: string;
    name: string;
    email: string;
    createdAt: string;
    updatedAt: string;
}

export default function Settings() {
    const { updateUser } = useAuth();

    const [loading, setLoading] = useState(true);

    const [profile, setProfile] = useState<Profile | null>(null);

    const [name, setName] = useState("");

    const [currentPassword, setCurrentPassword] = useState("");

    const [newPassword, setNewPassword] = useState("");

    const [confirmPassword, setConfirmPassword] = useState("");

    useEffect(() => {
        async function loadProfile() {
            try {
                const response = await getProfile();

                setProfile(response.data);

                setName(response.data.name);
            } catch {
                toast.error("Unable to load profile.");
            } finally {
                setLoading(false);
            }
        }

        loadProfile();
    }, []);

    const profileMutation = useMutation({
        mutationFn: updateProfile,

        onSuccess: (response) => {
            setProfile(response.data);

            updateUser(response.data);

            toast.success(response.message);
        },

        onError: (error: any) => {
            toast.error(
                error?.response?.data?.message ??
                "Unable to update profile."
            );
        },
    });

    const passwordMutation = useMutation({
        mutationFn: changePassword,

        onSuccess: (response) => {
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");

            toast.success(response.message);
        },

        onError: (error: any) => {
            toast.error(
                error?.response?.data?.message ??
                "Unable to change password."
            );
        },
    });

    function handleProfileSave() {
        const value = name.trim();

        if (!value) {
            toast.warning("Please enter your name.");
            return;
        }

        profileMutation.mutate(value);
    }

    function handlePasswordChange() {
        if (!currentPassword) {
            toast.warning("Enter current password.");
            return;
        }

        if (!newPassword) {
            toast.warning("Enter new password.");
            return;
        }

        if (newPassword.length < 6) {
            toast.warning(
                "Password must be at least 6 characters."
            );
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.warning("Passwords do not match.");
            return;
        }

        passwordMutation.mutate({
            currentPassword,
            newPassword,
        });
    }

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <p className="text-slate-500 dark:text-slate-400">
                    Loading profile...
                </p>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-5xl space-y-6 px-4 sm:px-6 md:space-y-8 md:px-0">

            <div>
                <h1 className="page-title">
                    Account Settings
                </h1>

                <p className="page-description">
                    Manage your profile information and account security.
                </p>
            </div>

            {/* Profile */}

            <section className="card">

                <div className="card-header">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                        👤 Profile Information
                    </h2>

                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Update your personal information.
                    </p>
                </div>

                <div className="card-body">

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">

                        <div>

                            <label className="label">
                                Full Name
                            </label>

                            <input
                                type="text"
                                value={name}
                                onChange={(e) =>
                                    setName(e.target.value)
                                }
                                className="input"
                            />

                        </div>

                        <div>

                            <label className="label">
                                Email Address
                            </label>

                            <input
                                type="email"
                                value={profile?.email ?? ""}
                                disabled
                                className="input cursor-not-allowed opacity-60"
                            />

                        </div>

                    </div>

                    <div className="mt-6 flex justify-end md:mt-8">

                        <button
                            onClick={handleProfileSave}
                            disabled={profileMutation.isPending}
                            className="btn-primary w-full sm:w-auto"
                        >
                            {profileMutation.isPending
                                ? "Saving..."
                                : "Save Changes"}
                        </button>

                    </div>

                </div>

            </section>

            {/* Change Password */}

            <section className="card">

                <div className="card-header">

                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                        🔒 Change Password
                    </h2>

                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Keep your account secure by updating your password regularly.
                    </p>

                </div>

                <div className="card-body">

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">

                        <div className="md:col-span-2">

                            <label className="label">
                                Current Password
                            </label>

                            <input
                                type="password"
                                value={currentPassword}
                                onChange={(e) =>
                                    setCurrentPassword(e.target.value)
                                }
                                className="input"
                                placeholder="Enter current password"
                            />

                        </div>

                        <div>

                            <label className="label">
                                New Password
                            </label>

                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) =>
                                    setNewPassword(e.target.value)
                                }
                                className="input"
                                placeholder="Enter new password"
                            />

                        </div>

                        <div>

                            <label className="label">
                                Confirm Password
                            </label>

                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) =>
                                    setConfirmPassword(e.target.value)
                                }
                                className="input"
                                placeholder="Confirm new password"
                            />

                        </div>

                    </div>

                    <div className="mt-6 flex justify-end md:mt-8">

                        <button
                            onClick={handlePasswordChange}
                            disabled={passwordMutation.isPending}
                            className="btn-primary w-full sm:w-auto"
                        >
                            {passwordMutation.isPending
                                ? "Updating..."
                                : "Update Password"}
                        </button>

                    </div>

                </div>

            </section>

        </div>
    );
}