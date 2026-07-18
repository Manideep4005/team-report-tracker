import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { changePassword } from "../../services/profile";

export default function Settings() {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

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
            toast.warning("Password must be at least 6 characters.");
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

    return (
        <div className="mx-auto max-w-3xl space-y-6 px-4 sm:px-6 md:px-0">
            <div>
                <h1 className="page-title">Change Password</h1>

                <p className="page-description">
                    Keep your account secure by updating your password regularly.
                </p>
            </div>

            <section className="card">
                <div className="card-header">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                        🔒 Change Password
                    </h2>

                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Enter your current password and choose a new one.
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