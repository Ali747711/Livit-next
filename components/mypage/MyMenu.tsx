import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useReactiveVar } from "@apollo/client/react";
import { userVar } from "@/apollo/store";
import { logOut } from "@/lib/auth";
import { getImageUrl } from "@/lib/utils";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  UserIcon,
  CallIcon,
  Home01Icon,
  FavouriteIcon,
  Search01Icon,
  UserGroupIcon,
  UserAdd01Icon,
  Notebook01Icon,
  PencilEdit01Icon,
  Logout01Icon,
  Award01Icon,
  Add01Icon,
  MessageIcon,
} from "@hugeicons/core-free-icons";

const MyMenu = () => {
  const router = useRouter();
  const category = (router.query?.category as string) ?? "myProfile";
  const user = useReactiveVar(userVar);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const logoutHandler = async () => {
    try {
      setShowLogoutConfirm(false);
      logOut();
      toast.success("Logged out successfully");
      router.push("/");
    } catch (err: any) {
      toast.error("Failed to logout");
    }
  };

  const getRankLabel = (type?: string) => {
    if (type === "ADMIN") return "Administrator";
    if (type === "AGENT") return "Agent";
    return "Member";
  };

  const menuSections = [
    {
      title: "Listings",
      items: [
        ...(user.memberType === "AGENT"
          ? [
              {
                category: "addProperty",
                label: "Add Property",
                icon: Add01Icon,
                badge: "New",
              },
              {
                category: "myProperties",
                label: "My Properties",
                icon: Home01Icon,
              },
            ]
          : []),
        { category: "myFavorites", label: "My Favorites", icon: FavouriteIcon },
        {
          category: "recentlyVisited",
          label: "Recently Visited",
          icon: Search01Icon,
        },
        { category: "followers", label: "My Followers", icon: UserGroupIcon },
        { category: "followings", label: "My Followings", icon: UserAdd01Icon },
      ],
    },
    {
      title: "Community",
      items: [
        { category: "myMessages", label: "Messages", icon: MessageIcon },
        { category: "myArticles", label: "My Articles", icon: Notebook01Icon },
        {
          category: "writeArticle",
          label: "Write Article",
          icon: PencilEdit01Icon,
          badge: "Create",
        },
      ],
    },
    {
      title: "Account",
      items: [{ category: "myProfile", label: "My Profile", icon: UserIcon }],
    },
  ];

  return (
    <>
      <div className="sticky top-24 space-y-3">
        {/* ── Profile card ─────────────────────────────────────────── */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: "#fff", border: "1px solid #ebebeb" }}
        >
          {/* Orange accent top */}
          <div
            style={{
              height: "3px",
              background:
                "linear-gradient(90deg, #F25912, #ff8c5a 40%, transparent)",
            }}
          />

          <div className="p-6 text-center">
            {/* Avatar */}
            <div
              className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-4"
              style={{ border: "3px solid #fff3ee" }}
            >
              {user?.memberImage ? (
                <img
                  src={getImageUrl(user.memberImage)}
                  alt={user.memberNick}
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src="/img/profiles/avatardef.png"
                  alt={user.memberNick}
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            <h2
              className="text-base font-extrabold mb-1"
              style={{ color: "#222831" }}
            >
              {user?.memberNick || "User"}
            </h2>

            <span
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide mb-3"
              style={{ background: "#fff3ee", color: "#F25912" }}
            >
              <HugeiconsIcon
                icon={Award01Icon}
                size={10}
                color="#F25912"
                strokeWidth={2.5}
              />
              {getRankLabel(user?.memberType)}
            </span>

            {user?.memberPhone && (
              <div className="flex items-center justify-center gap-1.5">
                <HugeiconsIcon
                  icon={CallIcon}
                  size={13}
                  color="#9ca3af"
                  strokeWidth={1.5}
                />
                <span className="text-xs" style={{ color: "#9ca3af" }}>
                  {user.memberPhone}
                </span>
              </div>
            )}

            {user?.memberType === "ADMIN" && (
              <a
                href="/admin/users"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-3 px-4 py-2 rounded-lg text-xs font-bold text-white transition-all"
                style={{ background: "#222831" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#F25912")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "#222831")
                }
              >
                Admin Panel
              </a>
            )}
          </div>
        </div>

        {/* ── Navigation sections ───────────────────────────────────── */}
        {menuSections.map((section, si) => (
          <div
            key={si}
            className="rounded-2xl overflow-hidden"
            style={{ background: "#fff", border: "1px solid #ebebeb" }}
          >
            <div
              className="px-4 py-3"
              style={{ borderBottom: "1px solid #f3f4f6" }}
            >
              <p
                className="text-[10px] font-bold uppercase tracking-[0.14em]"
                style={{ color: "#9ca3af" }}
              >
                {section.title}
              </p>
            </div>
            <nav className="p-1.5">
              {section.items.map((item) => {
                const isActive = category === item.category;
                return (
                  <Link
                    key={item.category}
                    href={{
                      pathname: "/mypage",
                      query: { category: item.category },
                    }}
                    scroll={false}
                  >
                    <div
                      className="flex items-center justify-between px-3 py-2.5 rounded-xl transition-all cursor-pointer"
                      style={{
                        background: isActive ? "#F25912" : "transparent",
                        color: isActive ? "#fff" : "#374151",
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive)
                          (e.currentTarget as HTMLDivElement).style.background =
                            "#f9fafb";
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive)
                          (e.currentTarget as HTMLDivElement).style.background =
                            "transparent";
                      }}
                    >
                      <div className="flex items-center gap-2.5">
                        <HugeiconsIcon
                          icon={item.icon}
                          size={17}
                          color={isActive ? "#fff" : "#9ca3af"}
                          strokeWidth={1.5}
                        />
                        <span className="text-sm font-semibold">
                          {item.label}
                        </span>
                      </div>
                      {(item as any).badge && (
                        <span
                          className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                          style={{
                            background: isActive
                              ? "rgba(255,255,255,0.25)"
                              : "#fff3ee",
                            color: isActive ? "#fff" : "#F25912",
                          }}
                        >
                          {(item as any).badge}
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}

        {/* ── Logout ────────────────────────────────────────────────── */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: "#fff", border: "1px solid #ebebeb" }}
        >
          <nav className="p-1.5">
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{ color: "#6b7280" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  "#fef2f2";
                (e.currentTarget as HTMLButtonElement).style.color = "#ef4444";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  "transparent";
                (e.currentTarget as HTMLButtonElement).style.color = "#6b7280";
              }}
            >
              <HugeiconsIcon
                icon={Logout01Icon}
                size={17}
                color="currentColor"
                strokeWidth={1.5}
              />
              Logout
            </button>
          </nav>
        </div>
      </div>

      {/* ── Logout modal ───────────────────────────────────────────── */}
      {showLogoutConfirm && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ background: "rgba(0,0,0,0.5)" }}
        >
          <div
            className="rounded-2xl p-6 max-w-sm w-full"
            style={{ background: "#fff" }}
          >
            <div className="text-center mb-6">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: "#fef2f2" }}
              >
                <HugeiconsIcon
                  icon={Logout01Icon}
                  size={28}
                  color="#ef4444"
                  strokeWidth={1.5}
                />
              </div>
              <h3
                className="text-lg font-extrabold mb-1"
                style={{ color: "#222831" }}
              >
                Confirm Logout
              </h3>
              <p className="text-sm" style={{ color: "#9ca3af" }}>
                Are you sure you want to log out?
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold border transition-all"
                style={{ borderColor: "#ebebeb", color: "#374151" }}
              >
                Cancel
              </button>
              <button
                onClick={logoutHandler}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all"
                style={{ background: "#ef4444" }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MyMenu;
