import {
    HiOutlineSquares2X2,
    HiOutlineClock,
    HiOutlineXMark,
    HiOutlineUserGroup,
    HiOutlineUsers,
    HiOutlineShieldCheck,
    HiOutlineDocumentText,
    HiOutlineArrowRightOnRectangle,
    HiOutlineKey,
    HiOutlineChevronUp,
    HiOutlineChevronDown,
    HiOutlineCog6Tooth,
    HiOutlineMoon,
    HiOutlineSun,
} from "react-icons/hi2";

import { NavLink, useNavigate } from "react-router-dom";
import {
    useEffect,
    useRef,
    useState,
} from "react";

import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

interface SidebarProps {
    open: boolean;
    onClose: () => void;
}

const avatarColors = [
    "bg-blue-600",
    "bg-emerald-600",
    "bg-violet-600",
    "bg-amber-600",
    "bg-rose-600",
    "bg-cyan-600",
    "bg-indigo-600",
    "bg-teal-600",
];

function getInitials(name?: string) {
    if (!name) return "";

    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase();
}

function getAvatarColor(name?: string) {
    if (!name) return avatarColors[0];

    const hash = [...name].reduce(
        (sum, char) => sum + char.charCodeAt(0),
        0
    );

    return avatarColors[
        hash % avatarColors.length
    ];
}

export default function Sidebar({
    open,
    onClose,
}: SidebarProps) {
    const {
        user,
        hasPermission,
        logout,
    } = useAuth();

    const { theme, toggleTheme } =
        useTheme();

    const navigate = useNavigate();

    const [accountOpen, setAccountOpen] =
        useState(false);

    /*
     * Account wrapper reference.
     * Used for outside-click detection.
     */
    const accountRef =
        useRef<HTMLDivElement>(null);

    const initials = getInitials(
        user?.name
    );

    const avatarColor =
        getAvatarColor(user?.name);

    /*
     * Lock body scrolling while
     * mobile sidebar is open.
     */
    useEffect(() => {
        document.body.style.overflow =
            open ? "hidden" : "";

        return () => {
            document.body.style.overflow =
                "";
        };
    }, [open]);

    /*
     * Close account popup when clicking
     * anywhere outside the account area.
     */
    useEffect(() => {
        function handleOutsideClick(
            event: MouseEvent
        ) {
            if (
                accountRef.current &&
                !accountRef.current.contains(
                    event.target as Node
                )
            ) {
                setAccountOpen(false);
            }
        }

        if (accountOpen) {
            document.addEventListener(
                "mousedown",
                handleOutsideClick
            );
        }

        return () => {
            document.removeEventListener(
                "mousedown",
                handleOutsideClick
            );
        };
    }, [accountOpen]);

    /*
     * Navigation link styling.
     */
    const linkClass = ({
        isActive,
    }: {
        isActive: boolean;
    }) =>
        `sidebar-link ${
            isActive
                ? "sidebar-link-active"
                : ""
        }`;

    /*
     * Logout.
     */
    async function handleLogout() {
        setAccountOpen(false);
        onClose();

        await logout();

        navigate("/");
    }

    /*
     * Change password.
     */
    function handleChangePassword() {
        setAccountOpen(false);
        onClose();

        navigate("/settings");
    }

    /*
     * Navigation.
     */
    const renderNavigation = (
        mobile = false
    ) => (
        <nav className="sidebar-nav">

            {/* =================================================
                WORKSPACE
                ================================================= */}

            <div className="sidebar-section">

                <p className="sidebar-section-label">
                    Workspace
                </p>

                {/* Dashboard */}
                <NavLink
                    to="/dashboard"
                    className={linkClass}
                    onClick={
                        mobile
                            ? onClose
                            : undefined
                    }
                >
                    <span className="sidebar-link-icon">
                        <HiOutlineSquares2X2
                            size={18}
                        />
                    </span>

                    <span>
                        Dashboard
                    </span>
                </NavLink>

                {/* My Reports */}
                {hasPermission(
                    "REPORT_VIEW_OWN"
                ) && (
                    <NavLink
                        to="/history"
                        className={linkClass}
                        onClick={
                            mobile
                                ? onClose
                                : undefined
                        }
                    >
                        <span className="sidebar-link-icon">
                            <HiOutlineClock
                                size={18}
                            />
                        </span>

                        <span>
                            My Reports
                        </span>
                    </NavLink>
                )}

                {/* All Reports */}
                {hasPermission(
                    "REPORT_VIEW_ALL"
                ) && (
                    <NavLink
                        to="/reports"
                        className={linkClass}
                        onClick={
                            mobile
                                ? onClose
                                : undefined
                        }
                    >
                        <span className="sidebar-link-icon">
                            <HiOutlineDocumentText
                                size={18}
                            />
                        </span>

                        <span>
                            All Reports
                        </span>
                    </NavLink>
                )}

            </div>

            {/* =================================================
                MANAGEMENT
                ================================================= */}

            <div className="sidebar-section">

                <p className="sidebar-section-label">
                    Management
                </p>

                {/* Users */}
                {hasPermission(
                    "USER_VIEW"
                ) && (
                    <NavLink
                        to="/users"
                        className={linkClass}
                        onClick={
                            mobile
                                ? onClose
                                : undefined
                        }
                    >
                        <span className="sidebar-link-icon">
                            <HiOutlineUsers
                                size={18}
                            />
                        </span>

                        <span>
                            Users
                        </span>
                    </NavLink>
                )}

                {/* Roles */}
                {hasPermission(
                    "ROLE_VIEW"
                ) && (
                    <NavLink
                        to="/roles"
                        className={linkClass}
                        onClick={
                            mobile
                                ? onClose
                                : undefined
                        }
                    >
                        <span className="sidebar-link-icon">
                            <HiOutlineShieldCheck
                                size={18}
                            />
                        </span>

                        <span>
                            Roles
                        </span>
                    </NavLink>
                )}

                {/* Permissions */}
                {hasPermission(
                    "PERMISSION_VIEW"
                ) && (
                    <NavLink
                        to="/permissions"
                        className={linkClass}
                        onClick={
                            mobile
                                ? onClose
                                : undefined
                        }
                    >
                        <span className="sidebar-link-icon">
                            <HiOutlineKey
                                size={18}
                            />
                        </span>

                        <span>
                            Permissions
                        </span>
                    </NavLink>
                )}

                {/* Login History */}
                {hasPermission(
                    "LOGIN_HISTORY_VIEW"
                ) && (
                    <NavLink
                        to="/login-history"
                        className={linkClass}
                        onClick={
                            mobile
                                ? onClose
                                : undefined
                        }
                    >
                        <span className="sidebar-link-icon">
                            <HiOutlineArrowRightOnRectangle
                                size={18}
                            />
                        </span>

                        <span>
                            Login History
                        </span>
                    </NavLink>
                )}

            </div>
        </nav>
    );

    /*
     * Brand.
     */
    const brand = (
        <div className="sidebar-brand">

            <div className="sidebar-brand-mark">
                <HiOutlineUserGroup
                    size={20}
                />
            </div>

            <div className="min-w-0">

                <h1 className="sidebar-brand-title">
                    Team Work
                </h1>

                <p className="sidebar-brand-subtitle">
                    Report Tracker
                </p>

            </div>

        </div>
    );

    /*
     * User card + account popup.
     */
    const userCard = (
        <div
            ref={accountRef}
            className="relative"
        >

            {/* =================================================
                ACCOUNT POPUP
                ================================================= */}

            {accountOpen && (
                <div
                    className="
                        absolute
                        bottom-[calc(100%+10px)]
                        left-0
                        z-[200]
                        w-[250px]

                        overflow-hidden
                        rounded-2xl

                        border
                        border-[var(--border)]

                        bg-[var(--surface-elevated)]

                        shadow-[0_20px_60px_rgba(0,0,0,0.25)]

                        backdrop-blur-xl

                        animate-in
                        fade-in
                        slide-in-from-bottom-2
                        duration-150
                    "
                >

                    {/* =================================================
                        PROFILE
                        ================================================= */}

                    <div className="sidebar-account-profile">

                        <div
                            className={`sidebar-account-avatar ${avatarColor}`}
                        >
                            {initials}
                        </div>

                        <div className="min-w-0">

                            <p className="sidebar-account-name">
                                {user?.name}
                            </p>

                            <p className="sidebar-account-email">
                                {user?.email}
                            </p>

                        </div>

                    </div>

                    <div className="sidebar-account-content">

                        {/* =================================================
                            THEME SETTING
                            ================================================= */}

                        <div className="flex min-h-11 w-full items-center justify-between gap-3 rounded-lg px-3">

                            <div className="flex min-w-0 items-center gap-2.5">

                                <span className="flex size-6 shrink-0 items-center justify-center text-[var(--text-muted)]">

                                    {theme === "dark" ? (
                                        <HiOutlineMoon
                                            size={16}
                                        />
                                    ) : (
                                        <HiOutlineSun
                                            size={16}
                                        />
                                    )}

                                </span>

                                <span className="text-xs font-medium text-[var(--text-secondary)]">
                                    {theme === "dark"
                                        ? "Dark mode"
                                        : "Light mode"}
                                </span>

                            </div>

                            {/* Theme Toggle */}
                            <button
                                type="button"
                                onClick={() => {
                                    toggleTheme();

                                    /*
                                     * Close popup immediately
                                     * after changing theme.
                                     */
                                    setAccountOpen(false);
                                }}
                                aria-label={
                                    theme === "dark"
                                        ? "Switch to light mode"
                                        : "Switch to dark mode"
                                }
                                aria-pressed={
                                    theme === "dark"
                                }
                                className={`relative h-5 w-9 shrink-0 cursor-pointer rounded-full border-0 p-0 transition-colors duration-200 ${
                                    theme === "dark"
                                        ? "bg-indigo-500"
                                        : "bg-slate-300"
                                }`}
                            >
                                <span
                                    className={`pointer-events-none absolute left-0.5 top-0.5 size-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                                        theme ===
                                        "dark"
                                            ? "translate-x-4"
                                            : "translate-x-0"
                                    }`}
                                />
                            </button>

                        </div>

                        {/* =================================================
                            CHANGE PASSWORD
                            ================================================= */}

                        <button
                            type="button"
                            onClick={
                                handleChangePassword
                            }
                            className="sidebar-account-item"
                        >
                            <span className="sidebar-account-item-left">

                                <span className="sidebar-account-item-icon">
                                    <HiOutlineCog6Tooth
                                        size={17}
                                    />
                                </span>

                                <span>
                                    Change Password
                                </span>

                            </span>
                        </button>

                        {/* Divider */}
                        <div className="sidebar-account-divider" />

                        {/* =================================================
                            LOGOUT
                            ================================================= */}

                        <button
                            type="button"
                            onClick={
                                handleLogout
                            }
                            className="sidebar-account-item sidebar-account-danger"
                        >
                            <span className="sidebar-account-item-left">

                                <span className="sidebar-account-item-icon">
                                    <HiOutlineArrowRightOnRectangle
                                        size={17}
                                    />
                                </span>

                                <span>
                                    Logout
                                </span>

                            </span>
                        </button>

                    </div>
                </div>
            )}

            {/* =================================================
                ACCOUNT BUTTON
                ================================================= */}

            <button
                type="button"
                onClick={() =>
                    setAccountOpen(
                        (previous) =>
                            !previous
                    )
                }
                aria-expanded={accountOpen}
                className={`
                    sidebar-user-card
                    relative
                    z-10
                    transition-all
                    duration-150
                    ${
                        accountOpen
                            ? "border-indigo-500/70 ring-1 ring-indigo-500/30"
                            : ""
                    }
                `}
            >

                {/* Avatar */}
                <div
                    className={`sidebar-user-avatar ${avatarColor}`}
                >
                    {initials}
                </div>

                {/* User information */}
                <div className="min-w-0 flex-1 text-left">

                    <p className="sidebar-user-name">
                        {user?.name}
                    </p>

                    <p className="sidebar-user-email">
                        {user?.email}
                    </p>

                </div>

                {/* Chevron */}
                <span className="sidebar-user-chevron">

                    {accountOpen ? (
                        <HiOutlineChevronUp
                            size={16}
                        />
                    ) : (
                        <HiOutlineChevronDown
                            size={16}
                        />
                    )}

                </span>

            </button>

        </div>
    );

    return (
        <>
            {/* =================================================
                MOBILE OVERLAY
                ================================================= */}

            <div
                onClick={() => {
                    setAccountOpen(false);
                    onClose();
                }}
                className={`
                    sidebar-overlay
                    ${
                        open
                            ? "sidebar-overlay-visible"
                            : ""
                    }
                `}
            />

            {/* =================================================
                MOBILE SIDEBAR
                ================================================= */}

            <aside
                className={`
                    sidebar-mobile
                    z-[100]
                    ${
                        open
                            ? "sidebar-mobile-open"
                            : ""
                    }
                `}
            >

                {/* Header */}
                <div className="sidebar-header">

                    {brand}

                    <button
                        type="button"
                        onClick={() => {
                            setAccountOpen(false);
                            onClose();
                        }}
                        aria-label="Close navigation"
                        className="sidebar-close-button"
                    >
                        <HiOutlineXMark
                            size={19}
                        />
                    </button>

                </div>

                {/* Navigation */}
                {renderNavigation(true)}

                {/* Footer */}
                <div className="sidebar-footer">
                    {userCard}
                </div>

            </aside>

            {/* =================================================
                DESKTOP SIDEBAR
                ================================================= */}

            <aside className="sidebar-desktop z-[100]">

                {/* Header */}
                <div className="sidebar-header">
                    {brand}
                </div>

                {/* Navigation */}
                {renderNavigation()}

                {/* Footer */}
                <div className="sidebar-footer">
                    {userCard}
                </div>

            </aside>
        </>
    );
}