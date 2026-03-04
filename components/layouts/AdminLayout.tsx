import React, { useState } from "react";
import { useRouter } from "next/router";
import { useReactiveVar } from "@apollo/client/react";
import { userVar } from "@/apollo/store";
import { logOut } from "@/lib/auth";
import { MemberType } from "@/lib/enums/member";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  DashboardSquare01Icon,
  UserGroupIcon,
  Home01Icon,
  MessageIcon,
  Settings01Icon,
  Logout01Icon,
  Menu01Icon,
  Cancel01Icon,
  DocumentValidationIcon,
  Notification01Icon,
  Search01Icon,
  ChevronsLeftRight,
} from "@hugeicons/core-free-icons";
import { getImageUrl } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: any;
  badge?: number;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: DashboardSquare01Icon },
  { label: "Users", href: "/admin/users", icon: UserGroupIcon },
  { label: "Properties", href: "/admin/properties", icon: Home01Icon },
  { label: "Articles", href: "/admin/articles", icon: DocumentValidationIcon },
  { label: "Comments", href: "/admin/comments", icon: MessageIcon },
  { label: "Profile", href: "/admin/profile", icon: Settings01Icon },
];

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const AdminLayout = ({ children, title = "Dashboard" }: AdminLayoutProps) => {
  const router = useRouter();
  const user = useReactiveVar(userVar);
  const [open, setOpen] = useState(false);

  const imageUrl = getImageUrl(user.memberImage as string);
  if (
    typeof window !== "undefined" &&
    user._id &&
    user.memberType !== MemberType.ADMIN
  ) {
    router.replace("/");
    return null;
  }

  const isActive = (href: string) =>
    href === "/admin"
      ? router.pathname === "/admin"
      : router.pathname.startsWith(href);

  return (
    <div className="h-screen bg-[#f4f6fb] flex overflow-hidden font-sans">
      {/* ── Mobile backdrop ── */}
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ══════════════════════════════
          SIDEBAR
      ══════════════════════════════ */}
      <aside
        className={`
          fixed top-0 left-0 h-screen w-[240px] z-30 flex flex-col
          bg-[#222831] text-white
          transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen lg:z-auto lg:shrink-0
        `}
      >
        {/* Logo area */}
        <div className="flex items-center justify-between px-5 pt-6 pb-5">
          <div className="flex  gap-2.5 flex-col">
            {/* Icon mark */}
            {/* <div className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-[#F25912] shadow-lg shadow-[rgba(242,89,18,0.35)]">
              <HugeiconsIcon
                icon={Home01Icon}
                size={18}
                color="white"
                strokeWidth={2}
              />
            </div> */}
            {/* Logo */}
            <button className="flex items-center gap-2.5 group cursor-pointer">
              <img
                src="/img/logo.png"
                alt="Logo"
                className="w-18 h-8 object-cover rounded-2xl"
              />
            </button>
            <div>
              <p className="text-[10px] text-slate-500 font-medium mt-0.5 tracking-widest uppercase">
                Admin
              </p>
            </div>
          </div>
          <button
            className="lg:hidden w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors"
            onClick={() => setOpen(false)}
          >
            <HugeiconsIcon
              icon={Cancel01Icon}
              size={16}
              strokeWidth={2}
              color="currentColor"
            />
          </button>
        </div>

        {/* Divider */}
        <div className="mx-5 h-px bg-white/[0.06] mb-3" />

        {/* Nav section label */}
        <p className="px-5 mb-2 text-[10px] font-semibold text-slate-600 tracking-[0.12em] uppercase">
          Navigation
        </p>

        {/* Nav links */}
        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto min-h-0 pb-4">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <button
                key={item.href}
                onClick={() => {
                  router.push(item.href);
                  setOpen(false);
                }}
                className={`
                  group w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13.5px] font-medium
                  transition-all duration-150 text-left relative
                  ${
                    active
                      ? "bg-[#F25912] text-white shadow-md shadow-[rgba(242,89,18,0.3)]"
                      : "text-slate-400 hover:text-white hover:bg-white/[0.06]"
                  }
                `}
              >
                {/* Active left bar */}

                <HugeiconsIcon
                  icon={item.icon}
                  size={17}
                  color="currentColor"
                  strokeWidth={active ? 2 : 1.5}
                  className={`shrink-0 transition-colors ${active ? "text-white" : "text-slate-500 group-hover:text-slate-300"}`}
                />
                <span className="flex-1">{item.label}</span>

                {item.badge ? (
                  <span className="ml-auto text-[10px] font-bold bg-[#F25912] text-white px-1.5 py-0.5 rounded-full min-w-4.5 text-center">
                    {item.badge}
                  </span>
                ) : active ? (
                  <HugeiconsIcon
                    icon={ChevronsLeftRight}
                    size={13}
                    color="rgba(255,255,255,0.5)"
                    strokeWidth={2.5}
                    className="ml-auto"
                  />
                ) : null}
              </button>
            );
          })}
        </nav>

        {/* Bottom: user card + logout */}
        <div className="mx-3 mb-4 mt-auto rounded-xl bg-white/[0.04] border border-white/[0.06] p-3 space-y-3 shrink-0">
          {/* User info */}
          <div className="flex items-center gap-2.5">
            <div className="relative shrink-0">
              <img
                src={
                  user.memberImage
                    ? `${imageUrl}`
                    : "/img/profiles/avatardef.png"
                }
                alt={user.memberNick}
                className="w-9 h-9 rounded-xl object-cover bg-slate-700 ring-1 ring-white/10"
              />
              {/* Online dot */}
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-[#222831]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-white truncate leading-tight">
                {user.memberFullName || user.memberNick}
              </p>
              <p className="text-[11px] text-slate-500 truncate">
                @{user.memberNick}
              </p>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={logOut}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium
              text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-150"
          >
            <HugeiconsIcon
              icon={Logout01Icon}
              size={15}
              color="currentColor"
              strokeWidth={1.5}
            />
            Sign out
          </button>
        </div>
      </aside>

      {/* ══════════════════════════════
          MAIN CONTENT AREA
      ══════════════════════════════ */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* ── Topbar ── */}
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-5 lg:px-8 h-[60px] flex items-center gap-4 shadow-xs">
          {/* Mobile hamburger */}
          <button
            className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            onClick={() => setOpen(true)}
          >
            <HugeiconsIcon
              icon={Menu01Icon}
              size={20}
              color="currentColor"
              strokeWidth={2}
            />
          </button>

          {/* Page title / breadcrumb */}
          <div className="flex items-center gap-2">
            <span className="hidden sm:block text-xs text-slate-400 font-medium">
              Admin
            </span>
            <span className="hidden sm:block text-slate-300">/</span>
            <h1 className="text-sm font-semibold text-slate-800">{title}</h1>
          </div>

          {/* Right side controls */}
          <div className="ml-auto flex items-center gap-2">
            {/* Search trigger */}
            <button className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors text-slate-500 text-xs">
              <HugeiconsIcon
                icon={Search01Icon}
                size={14}
                strokeWidth={1.5}
                color="currentColor"
              />
              <span>Search…</span>
              <kbd className="ml-1 px-1 py-0.5 rounded text-[10px] font-mono bg-white ring-1 ring-slate-200 text-slate-400">
                ⌘K
              </kbd>
            </button>

            {/* Notification bell */}
            <button className="relative w-9 h-9 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors">
              <HugeiconsIcon
                icon={Notification01Icon}
                size={18}
                strokeWidth={1.5}
                color="currentColor"
              />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
            </button>

            {/* Divider */}
            <div className="w-px h-5 bg-slate-200 mx-1" />

            {/* Avatar */}
            <div className="flex items-center gap-2.5 pl-1">
              <div className="hidden sm:block text-right">
                <p className="text-xs font-semibold text-slate-700 leading-tight">
                  {user.memberFullName || user.memberNick}
                </p>
                <p className="text-[10px] text-slate-400">Administrator</p>
              </div>
              <img
                src={
                  user.memberImage
                    ? `${process.env.NEXT_PUBLIC_GRAPHQL_URL_IMG}${user.memberImage}`
                    : "/img/profiles/avatardef.png"
                }
                alt={user.memberNick}
                className="w-8 h-8 rounded-xl object-cover bg-slate-200 ring-2 ring-slate-200"
              />
            </div>
          </div>
        </header>

        {/* ── Page content ── */}
        <main className="flex-1 p-5 lg:p-8 overflow-auto">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
