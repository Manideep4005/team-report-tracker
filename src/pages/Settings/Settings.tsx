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
        <div className="mx-auto max-w-2xl space-y-6 py-2 sm:py-4">
            <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl">Change Password</h1>
                <p className="mt-1 text-xs text-slate-500 dark:text-zinc-500">
                    Update your password to keep your account secure.
                </p>
            </div>

            <section className="card">
                <div className="card-body">
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
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

                    <div className="mt-6 flex justify-end">
                        <button
                            onClick={handlePasswordChange}
                            disabled={passwordMutation.isPending}
                            className="btn-primary w-full sm:w-auto text-xs font-semibold py-2 px-4"
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