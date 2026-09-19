import {
  HiOutlineArrowRightOnRectangle,
  HiOutlineChatBubbleLeftRight,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineChevronDown,
  HiOutlineChevronUp,
  HiOutlineClock,
  HiOutlineCog6Tooth,
  HiOutlineDocumentText,
  HiOutlineKey,
  HiOutlineLink,
  HiOutlineMoon,
  HiOutlineShieldCheck,
  HiOutlineSquares2X2,
  HiOutlineSun,
  HiOutlineUserCircle,
  HiOutlineUsers,
  HiOutlineXMark,
} from "react-icons/hi2";
import { NavLink, useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import UserAvatar from "./UserAvatar";

interface SidebarProps {
  open: boolean;
  collapsed: boolean;
  onClose: () => void;
  onToggleCollapse: () => void;
}

type Tooltip = { label: string; top: number; left: number } | null;

const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

export default function Sidebar({ open, collapsed, onClose, onToggleCollapse }: SidebarProps) {
  const { user, hasPermission, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [accountOpen, setAccountOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const [tooltip, setTooltip] = useState<Tooltip>(null);
  const accountRefDesktop = useRef<HTMLDivElement>(null);
  const accountRefMobile = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!accountRefDesktop.current?.contains(target) && !accountRefMobile.current?.contains(target)) {
        setAccountOpen(false);
        setThemeOpen(false);
      }
    };
    if (accountOpen || themeOpen) document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [accountOpen, themeOpen]);

  const closeMenus = () => { setAccountOpen(false); setThemeOpen(false); };
  const handleLogout = async () => { closeMenus(); onClose(); await logout(); navigate("/"); };
  const goTo = (path: string) => { closeMenus(); onClose(); navigate(path); };
  const showManagementSection = hasPermission("USER_VIEW") || hasPermission("ROLE_VIEW") || hasPermission("PERMISSION_VIEW") || hasPermission("LOGIN_HISTORY_VIEW") || hasPermission("PUBLIC_MONITOR_VIEW");

  const showTooltip = (label: string, element: HTMLAnchorElement) => {
    if (!collapsed) return;
    const rect = element.getBoundingClientRect();
    setTooltip({ label, top: rect.top + rect.height / 2, left: rect.right + 10 });
  };

  const NavItem = ({ to, label, icon, visible = true, mobile }: { to: string; label: string; icon: ReactNode; visible?: boolean; mobile: boolean }) => {
    if (!visible) return null;
    return (
      <NavLink
        to={to}
        onClick={mobile ? onClose : undefined}
        onMouseEnter={(event) => !mobile && showTooltip(label, event.currentTarget)}
        onMouseLeave={() => setTooltip(null)}
        className={({ isActive }) => cx(
          "relative flex min-h-10 w-full items-center gap-3 rounded-[var(--radius-md)] px-3 text-[13px] font-medium text-[var(--text-secondary)] no-underline transition-[background-color,color,box-shadow] duration-150 hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]",
          isActive && "bg-[var(--brand-soft)] text-[var(--brand)] shadow-[inset_0_0_0_1px_rgb(79_70_229_/_0.08)] before:absolute before:left-0 before:top-1/2 before:h-5 before:w-[3px] before:-translate-y-1/2 before:rounded-r before:bg-[var(--brand)] dark:bg-indigo-400/10 dark:text-indigo-300",
          collapsed && !mobile && "mx-auto min-h-11 w-14 justify-center gap-0 px-0",
        )}
      >
        <span className={cx("flex h-7 w-7 shrink-0 items-center justify-center text-[var(--text-muted)]", collapsed && !mobile && "h-10 w-10")}>{icon}</span>
        {(!collapsed || mobile) && <span>{label}</span>}
      </NavLink>
    );
  };

  const renderNavigation = (mobile = false) => (
    <nav className={cx("min-w-0 flex-1 overflow-y-auto px-3 py-5", collapsed && !mobile && "px-2 pb-5 pt-8")}>
      <div className="mb-7 last:mb-0">
        {!collapsed || mobile ? <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--text-subtle)]">Workspace</p> : <div className="mx-auto mb-3 h-px w-7 bg-[var(--border-subtle)]" />}
        <NavItem to="/dashboard" label="Dashboard" icon={<HiOutlineSquares2X2 size={19} />} mobile={mobile} />
        <NavItem to="/chat" label="Chat" icon={<HiOutlineChatBubbleLeftRight size={19} />} visible={hasPermission("CHATS_VIEW")} mobile={mobile} />
        <NavItem to="/history" label="My Reports" icon={<HiOutlineClock size={19} />} visible={hasPermission("REPORT_VIEW_OWN")} mobile={mobile} />
        <NavItem to="/reports" label="All Reports" icon={<HiOutlineDocumentText size={19} />} visible={hasPermission("REPORT_VIEW_ALL")} mobile={mobile} />
        <NavItem to="/resume" label="Resume" icon={<HiOutlineDocumentText size={19} />} visible={hasPermission("RESUME_VIEW")} mobile={mobile} />
      </div>
      {showManagementSection && <div className="mb-7 last:mb-0">
        {!collapsed || mobile ? <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--text-subtle)]">Management</p> : <div className="mx-auto mb-3 h-px w-7 bg-[var(--border-subtle)]" />}
        <NavItem to="/users" label="Users" icon={<HiOutlineUsers size={19} />} visible={hasPermission("USER_VIEW")} mobile={mobile} />
        <NavItem to="/roles" label="Roles" icon={<HiOutlineShieldCheck size={19} />} visible={hasPermission("ROLE_VIEW")} mobile={mobile} />
        <NavItem to="/permissions" label="Permissions" icon={<HiOutlineKey size={19} />} visible={hasPermission("PERMISSION_VIEW")} mobile={mobile} />
        <NavItem to="/login-history" label="Login History" icon={<HiOutlineArrowRightOnRectangle size={19} />} visible={hasPermission("LOGIN_HISTORY_VIEW")} mobile={mobile} />
        <NavItem to="/public-monitor" label="Public Monitor" icon={<HiOutlineLink size={19} />} visible={hasPermission("PUBLIC_MONITOR_VIEW")} mobile={mobile} />
      </div>}
    </nav>
  );

  const brand = (mobile = false) => (
    <div className={cx("flex min-w-0 items-center gap-3", collapsed && !mobile && "justify-center")}>
      <div className="flex h-9 w-8 shrink-0 items-center justify-center overflow-hidden rounded-xl">
        <img src="/group.png" alt="Team Work" className="h-full w-full object-cover" />
      </div>
      {(!collapsed || mobile) && <div className="min-w-0"><h1 className="truncate text-sm font-bold tracking-tight text-[var(--text-primary)]">Team Work</h1><p className="mt-0.5 truncate text-[10px] font-medium text-[var(--text-muted)]">Report Tracker</p></div>}
    </div>
  );

  const ThemeOption = ({ value, title, description, icon }: { value: "light" | "dark" | "system"; title: string; description: string; icon: ReactNode }) => {
    const selected = theme === value;
    const iconColour = value === "light" ? "bg-amber-500/10 text-amber-500" : value === "dark" ? "bg-indigo-500/10 text-indigo-500" : "bg-slate-500/10 text-slate-500";
    return <button type="button" onClick={() => { setTheme(value); setThemeOpen(false); }} className={cx("mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] first:mt-0", selected && "bg-indigo-500/10 text-[var(--brand)] hover:bg-indigo-500/15")}><span className={cx("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", iconColour)}>{icon}</span><span className="min-w-0 flex-1"><span className="block text-xs font-semibold">{title}</span><span className="mt-0.5 block text-[10px] leading-4 text-[var(--text-muted)]">{description}</span></span>{selected && <span className="shrink-0 text-sm font-bold text-[var(--brand)]">✓</span>}</button>;
  };

  const renderUserCard = (accountRef: React.RefObject<HTMLDivElement | null>, mobile = false) => (
    <div ref={accountRef} className={cx("relative w-full", collapsed && !mobile && "flex justify-center")}>
      {accountOpen && <div className={cx("absolute bottom-[calc(100%+12px)] left-0 z-[500] w-[250px] overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)] shadow-[0_20px_60px_rgb(0_0_0_/_0.20)] backdrop-blur-xl dark:shadow-[0_20px_60px_rgb(0_0_0_/_0.40)]", collapsed && !mobile && "bottom-0 left-[calc(100%+12px)]")}>
        <div className="flex items-center gap-3 border-b border-[var(--border-subtle)] p-4"><UserAvatar name={user.name} avatarUrl={user.avatarUrl} /><div className="min-w-0"><p className="truncate text-sm font-semibold text-[var(--text-primary)]">{user?.name}</p><p className="mt-0.5 truncate text-xs text-[var(--text-muted)]">{user?.email}</p></div></div>
        <div className="p-1.5">
          <button type="button" onClick={() => setThemeOpen(true)} className="flex min-h-10 w-full items-center justify-between gap-3 rounded-[var(--radius-md)] px-3 text-left text-xs font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"><span className="flex min-w-0 items-center gap-2.5"><span className="flex h-6 w-6 shrink-0 items-center justify-center text-[var(--text-muted)]">{theme === "dark" ? <HiOutlineMoon size={17} /> : theme === "light" ? <HiOutlineSun size={17} /> : <span className="text-[15px]">🖥️</span>}</span>Theme</span><span className="shrink-0 text-[10px] font-medium capitalize text-[var(--text-muted)]">{theme === "system" ? "System" : theme}</span></button>
          <button type="button" onClick={() => goTo("/profile")} className="flex min-h-10 w-full items-center gap-2.5 rounded-[var(--radius-md)] px-3 text-left text-xs font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"><span className="flex h-6 w-6 items-center justify-center text-[var(--text-muted)]"><HiOutlineUserCircle size={17} /></span>Profile</button>
          <button type="button" onClick={() => goTo("/settings")} className="flex min-h-10 w-full items-center gap-2.5 rounded-[var(--radius-md)] px-3 text-left text-xs font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"><span className="flex h-6 w-6 items-center justify-center text-[var(--text-muted)]"><HiOutlineCog6Tooth size={17} /></span>Settings</button>
          <div className="my-1 border-t border-[var(--border-subtle)]" />
          <button type="button" onClick={handleLogout} className="flex min-h-10 w-full items-center gap-2.5 rounded-[var(--radius-md)] px-3 text-left text-xs font-medium text-[var(--danger)] transition-colors hover:bg-[var(--danger-soft)]"><span className="flex h-6 w-6 items-center justify-center"><HiOutlineArrowRightOnRectangle size={17} /></span>Logout</button>
        </div>
      </div>}
      {themeOpen && <div className={cx("absolute bottom-[calc(100%+12px)] left-0 z-[600] w-[270px] overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)] shadow-[0_24px_70px_rgb(0_0_0_/_0.22)] backdrop-blur-xl dark:shadow-[0_24px_70px_rgb(0_0_0_/_0.45)]", collapsed && !mobile && "bottom-0 left-[calc(100%+12px)]")}>
        <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] p-3"><button type="button" onClick={() => setThemeOpen(false)} aria-label="Back to account menu" title="Back" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]">←</button><div className="min-w-0"><p className="text-sm font-semibold text-[var(--text-primary)]">Theme</p><p className="mt-0.5 text-[10px] text-[var(--text-muted)]">Choose your appearance</p></div></div>
        <div className="p-2"><ThemeOption value="light" title="Light" description="Always use light mode" icon={<HiOutlineSun size={18} />} /><ThemeOption value="dark" title="Dark" description="Always use dark mode" icon={<HiOutlineMoon size={18} />} /><ThemeOption value="system" title="System" description="Follow your device settings" icon={<span className="text-[15px]">🖥️</span>} /></div>
      </div>}
      <button type="button" onClick={() => { setAccountOpen((previous) => !previous); setThemeOpen(false); }} aria-expanded={accountOpen} title={collapsed && !mobile ? user?.name : undefined} className={cx("flex w-full items-center gap-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-subtle)] p-3 text-left text-[var(--text-primary)] transition-[background-color,border-color,box-shadow] hover:border-[var(--border-strong)] hover:bg-[var(--surface-hover)] hover:shadow-[var(--shadow-xs)]", accountOpen && "border-indigo-500/55 shadow-[0_0_0_2px_rgb(99_102_241_/_0.10)]", collapsed && !mobile && "h-12 w-12 justify-center p-2")}><UserAvatar name={user.name} avatarUrl={user.avatarUrl} />{(!collapsed || mobile) && <><div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold">{user?.name}</p><p className="mt-0.5 truncate text-[10px] text-[var(--text-muted)]">{user?.role?.name?.toLocaleLowerCase().replace("_", " ")}</p></div><span className="flex h-6 w-6 shrink-0 items-center justify-center text-[var(--text-muted)]">{accountOpen ? <HiOutlineChevronUp size={16} /> : <HiOutlineChevronDown size={16} />}</span></>}</button>
    </div>
  );

  return <>
    <div onClick={() => { closeMenus(); onClose(); }} className={cx("pointer-events-none fixed inset-0 z-[190] bg-slate-900/40 opacity-0 backdrop-blur-[3px] transition-[opacity,visibility] duration-300 lg:hidden", open && "pointer-events-auto visible opacity-100")} />
    <aside className={cx("fixed inset-y-0 left-0 z-[200] flex w-[min(280px,86vw)] -translate-x-full flex-col border-r border-[var(--border)] bg-[var(--surface)] shadow-[20px_0_60px_rgb(15_23_42_/_0.12)] transition-transform duration-300 ease-out dark:shadow-[20px_0_60px_rgb(0_0_0_/_0.35)] lg:hidden", open && "translate-x-0")}>
      <div className="flex items-center justify-between gap-3 border-b border-[var(--border-subtle)] p-4">{brand(true)}<button type="button" onClick={() => { closeMenus(); onClose(); }} aria-label="Close navigation" title="Close navigation" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[9px] border border-[var(--border)] bg-[var(--surface-subtle)] text-[var(--text-muted)] transition-all hover:rotate-90 hover:border-[var(--border-strong)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"><HiOutlineXMark size={20} /></button></div>
      {renderNavigation(true)}<div className="shrink-0 border-t border-[var(--border-subtle)] bg-[var(--surface)] p-4">{renderUserCard(accountRefMobile, true)}</div>
    </aside>
    <aside className={cx("relative sticky top-0 z-40 hidden h-screen min-h-0 flex-col overflow-visible border-r border-[var(--border)] bg-[var(--surface)] shadow-[6px_0_24px_rgb(15_23_42_/_0.04)] transition-[width] duration-200 lg:flex", collapsed ? "w-[72px]" : "w-[248px]")}>
      <div className={cx("flex min-h-[72px] items-center border-b border-[var(--border-subtle)]", collapsed ? "justify-center" : "justify-between gap-3 px-4")}>{brand()}</div>
      <button type="button" onClick={onToggleCollapse} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} title={collapsed ? "Expand sidebar" : "Collapse sidebar"} className="absolute -right-3 top-[72px] z-20 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--text-muted)] shadow-[0_3px_10px_rgb(15_23_42_/_0.12)] transition-all duration-150 hover:scale-105 hover:border-indigo-400/60 hover:bg-indigo-500/10 hover:text-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 dark:shadow-[0_3px_10px_rgb(0_0_0_/_0.28)] dark:hover:text-indigo-300">
        <span aria-hidden="true" className="absolute -inset-1 -z-10 rounded-full bg-indigo-400/25 blur-md animate-pulse motion-reduce:animate-none dark:bg-indigo-400/35" />
        {collapsed ? <HiOutlineChevronRight size={17} strokeWidth={2.25} /> : <HiOutlineChevronLeft size={17} strokeWidth={2.25} />}
      </button>
      {renderNavigation(false)}<div className={cx("relative shrink-0 border-t border-[var(--border-subtle)] bg-[var(--surface)]", collapsed ? "p-3" : "p-4")}>{renderUserCard(accountRefDesktop)}</div>
    </aside>
    {tooltip && typeof document !== "undefined" && createPortal(<div role="tooltip" className="pointer-events-none fixed z-[1000] -translate-y-1/2 whitespace-nowrap rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] px-2.5 py-[7px] text-[11px] font-semibold text-[var(--text-primary)] shadow-[var(--shadow-md)]" style={{ top: tooltip.top, left: tooltip.left }}>{tooltip.label}</div>, document.body)}
  </>;
}
