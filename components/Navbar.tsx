import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Home01Icon,
  Building01Icon,
  UserGroupIcon,
  InformationCircleIcon,
  Menu01Icon,
  Cancel01Icon,
  UserIcon,
  Login01Icon,
  Logout01Icon,
  MessageIcon,
  Notification01Icon,
  UserEdit01Icon,
} from "@hugeicons/core-free-icons";
import { useReactiveVar } from "@apollo/client/react";
import { notifCountVar } from "@/apollo/store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getImageUrl } from "@/lib/utils";

interface NavbarProps {
  user?: any;
  onLogout?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const notifCount = useReactiveVar(notifCountVar);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Home", href: "/", icon: Home01Icon },
    { label: "Properties", href: "/property", icon: Building01Icon },
    { label: "Community", href: "/community", icon: MessageIcon },
    { label: "Agents", href: "/agent", icon: UserGroupIcon },
    { label: "About", href: "/about", icon: InformationCircleIcon },
  ];

  const isActive = (href: string) =>
    href === "/" ? router.pathname === "/" : router.pathname.startsWith(href);

  // Pages with dark hero — keep navbar transparent until scrolled
  const hasDarkHero =
    router.pathname === "/" || router.pathname.startsWith("/community");

  const isTransparent = hasDarkHero && !scrolled;

  const handleNavigation = (href: string) => {
    router.push(href);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50"
        style={{
          background: isTransparent ? "transparent" : "#fff",
          borderBottom: isTransparent
            ? "1px solid rgba(255,255,255,0.1)"
            : "1px solid #ebebeb",
          boxShadow: isTransparent ? "none" : "0 1px 16px rgba(0,0,0,0.06)",
          transition: "background 0.4s, border-color 0.4s, box-shadow 0.4s",
        }}
      >
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <button
              onClick={() => handleNavigation("/")}
              className="flex items-center gap-2.5 group cursor-pointer"
            >
              <img
                src="/img/logo.png"
                alt="Logo"
                className="w-20 h-9 object-cover rounded-2xl"
              />
            </button>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const active = isActive(link.href);
                return (
                  <button
                    key={link.href}
                    onClick={() => handleNavigation(link.href)}
                    className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                    style={{
                      color: isTransparent
                        ? active
                          ? "#fff"
                          : "rgba(255,255,255,0.65)"
                        : active
                          ? "#F25912"
                          : "#6b7280",
                      background: isTransparent
                        ? active
                          ? "rgba(255,255,255,0.12)"
                          : "transparent"
                        : active
                          ? "#fff3ee"
                          : "transparent",
                    }}
                    onMouseEnter={(e) => {
                      if (!active) {
                        (e.currentTarget as HTMLButtonElement).style.color =
                          isTransparent ? "#fff" : "#F25912";
                        (
                          e.currentTarget as HTMLButtonElement
                        ).style.background = isTransparent
                          ? "rgba(255,255,255,0.1)"
                          : "#fff8f5";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!active) {
                        (e.currentTarget as HTMLButtonElement).style.color =
                          isTransparent ? "rgba(255,255,255,0.65)" : "#6b7280";
                        (
                          e.currentTarget as HTMLButtonElement
                        ).style.background = "transparent";
                      }
                    }}
                  >
                    {link.label}
                  </button>
                );
              })}
            </div>

            {/* Desktop Auth */}
            <div className="hidden md:flex items-center gap-2">
              {/* Notification bell — only when logged in */}
              {user?.memberNick && (
                <button
                  onClick={() => handleNavigation("/messages")}
                  className="relative w-9 h-9 rounded-lg flex items-center justify-center transition-all"
                  style={{
                    color: isTransparent ? "rgba(255,255,255,0.7)" : "#6b7280",
                    background: "transparent",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.color =
                      isTransparent ? "#fff" : "#222831";
                    (e.currentTarget as HTMLButtonElement).style.background =
                      isTransparent ? "rgba(255,255,255,0.1)" : "#f3f4f6";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.color =
                      isTransparent ? "rgba(255,255,255,0.7)" : "#6b7280";
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "transparent";
                  }}
                  title="Messages & Notifications"
                >
                  <HugeiconsIcon
                    icon={Notification01Icon}
                    size={19}
                    color="currentColor"
                    strokeWidth={1.5}
                  />
                  {notifCount > 0 && (
                    <span
                      className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-white text-[9px] font-extrabold flex items-center justify-center"
                      style={{ background: "#F25912" }}
                    >
                      {notifCount > 9 ? "9+" : notifCount}
                    </span>
                  )}
                </button>
              )}

              {/* Avatar with hover dropdown */}
              <div
                onMouseEnter={() => setAvatarOpen(true)}
                onMouseLeave={() => setAvatarOpen(false)}
              >
                <DropdownMenu
                  open={avatarOpen}
                  onOpenChange={setAvatarOpen}
                  modal={false}
                >
                  <DropdownMenuTrigger asChild>
                    <button
                      className="flex items-center justify-center rounded-full transition-all focus:outline-none"
                      style={{
                        width: 36,
                        height: 36,
                        background: user?.memberNick
                          ? isTransparent
                            ? "rgba(255,255,255,0.15)"
                            : "#f3f4f6"
                          : "transparent",
                        border: user?.memberNick
                          ? `2px solid ${isTransparent ? "rgba(255,255,255,0.3)" : "#e8e8e3"}`
                          : "none",
                        padding: 0,
                        overflow: "hidden",
                      }}
                    >
                      {user?.memberImage ? (
                        <img
                          src={getImageUrl(user.memberImage)}
                          alt={user.memberNick}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <HugeiconsIcon
                          icon={UserIcon}
                          size={18}
                          color={
                            isTransparent ? "rgba(255,255,255,0.8)" : "#6b7280"
                          }
                          strokeWidth={1.5}
                        />
                      )}
                    </button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end" className="w-52 p-1.5">
                    {user?.memberNick ? (
                      <>
                        {/* User info header */}
                        <div className="px-3 py-2.5 mb-1">
                          <p
                            className="text-sm font-extrabold truncate"
                            style={{ color: "#222831" }}
                          >
                            {user.memberNick}
                          </p>
                          <p
                            className="text-[11px] mt-0.5 capitalize"
                            style={{ color: "#9ca3af" }}
                          >
                            {user.memberType?.toLowerCase() ?? "member"}
                          </p>
                        </div>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() =>
                            handleNavigation(`/mypage?memberId=${user._id}`)
                          }
                        >
                          <HugeiconsIcon
                            icon={UserEdit01Icon}
                            size={16}
                            color="#6b7280"
                            strokeWidth={1.5}
                          />
                          My Profile
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => {
                            onLogout?.();
                            setAvatarOpen(false);
                          }}
                          className="text-red-500 focus:text-red-500 focus:bg-red-50"
                        >
                          <HugeiconsIcon
                            icon={Logout01Icon}
                            size={16}
                            color="#ef4444"
                            strokeWidth={1.5}
                          />
                          Logout
                        </DropdownMenuItem>
                      </>
                    ) : (
                      <>
                        <DropdownMenuLabel>Account</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleNavigation("/account")}
                        >
                          <HugeiconsIcon
                            icon={Login01Icon}
                            size={16}
                            color="#6b7280"
                            strokeWidth={1.5}
                          />
                          Sign In
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleNavigation("/account")}
                          className="font-bold"
                          style={{ color: "#F25912" }}
                        >
                          <HugeiconsIcon
                            icon={UserIcon}
                            size={16}
                            color="#F25912"
                            strokeWidth={1.5}
                          />
                          Sign Up
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg transition-all"
              style={{
                color: isTransparent ? "#fff" : "#222831",
                background: isTransparent ? "rgba(255,255,255,0.1)" : "#f3f4f6",
              }}
            >
              <HugeiconsIcon
                icon={mobileMenuOpen ? Cancel01Icon : Menu01Icon}
                size={22}
                color="currentColor"
                strokeWidth={2}
              />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div
            className="md:hidden"
            style={{
              background: "#fff",
              borderTop: "1px solid #ebebeb",
            }}
          >
            <div className="container mx-auto px-6 max-w-7xl py-4 space-y-1">
              {navLinks.map((link) => {
                const active = isActive(link.href);
                return (
                  <button
                    key={link.href}
                    onClick={() => handleNavigation(link.href)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all"
                    style={{
                      color: active ? "#F25912" : "#6b7280",
                      background: active ? "#fff3ee" : "transparent",
                    }}
                  >
                    <HugeiconsIcon
                      icon={link.icon}
                      size={18}
                      color="currentColor"
                      strokeWidth={1.5}
                    />
                    {link.label}
                  </button>
                );
              })}

              <div
                style={{
                  borderTop: "1px solid #ebebeb",
                  paddingTop: "12px",
                  marginTop: "8px",
                }}
              >
                {user?.memberNick ? (
                  <>
                    {/* User info row */}
                    <div className="flex items-center gap-3 px-4 py-3 mb-1">
                      <div
                        className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center"
                        style={{
                          background: "#f3f4f6",
                          border: "2px solid #e8e8e3",
                        }}
                      >
                        {user.memberImage ? (
                          <img
                            src={getImageUrl(user.memberImage)}
                            alt={user.memberNick}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <HugeiconsIcon
                            icon={UserIcon}
                            size={16}
                            color="#6b7280"
                            strokeWidth={1.5}
                          />
                        )}
                      </div>
                      <div>
                        <p
                          className="text-sm font-extrabold"
                          style={{ color: "#222831" }}
                        >
                          {user.memberNick}
                        </p>
                        <p
                          className="text-[11px] capitalize"
                          style={{ color: "#9ca3af" }}
                        >
                          {user.memberType?.toLowerCase() ?? "member"}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        handleNavigation(`/mypage?memberId=${user._id}`)
                      }
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-left"
                      style={{ color: "#6b7280" }}
                    >
                      <HugeiconsIcon
                        icon={UserEdit01Icon}
                        size={18}
                        color="currentColor"
                        strokeWidth={1.5}
                      />
                      My Profile
                    </button>
                    <button
                      onClick={() => {
                        onLogout?.();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-left"
                      style={{ color: "#ef4444" }}
                    >
                      <HugeiconsIcon
                        icon={Logout01Icon}
                        size={18}
                        color="currentColor"
                        strokeWidth={1.5}
                      />
                      Logout
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleNavigation("/account")}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-full text-sm font-bold text-white"
                    style={{ background: "#F25912" }}
                  >
                    <HugeiconsIcon
                      icon={Login01Icon}
                      size={17}
                      color="white"
                      strokeWidth={2}
                    />
                    Sign In
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Spacer for non-hero pages */}
      {!hasDarkHero && <div className="h-16" />}
    </>
  );
};

export default Navbar;
