import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { GET_MEMBER } from "@/apollo/user/query";
import { Member } from "@/lib/types/member/member";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  UserIcon,
  CallIcon,
  Home01Icon,
  UserGroupIcon,
  UserAdd01Icon,
  Notebook01Icon,
  UserRemove01Icon,
  Award01Icon,
} from "@hugeicons/core-free-icons";
import { getImageUrl } from "@/lib/utils";
import { useQuery } from "@apollo/client/react";

const MemberMenu = ({ subscribeHandler, unsubscribeHandler }: any) => {
  const router = useRouter();
  const { memberId, category } = router.query;
  const [member, setMember] = useState<Member | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const {
    data: MemberData,
    loading: MemberLoading,
    refetch: getMemberRefetch,
  } = useQuery<any>(GET_MEMBER, {
    fetchPolicy: "network-only",
    variables: { input: memberId },
    skip: !memberId,
    notifyOnNetworkStatusChange: true,
  });

  useEffect(() => {
    if (MemberData?.getMember) setMember(MemberData.getMember);
  }, [MemberData]);

  useEffect(() => {
    if (memberId) getMemberRefetch();
  }, [memberId]);

  const isFollowing = member?.meFollowed && member.meFollowed[0]?.myFollowing;

  const getRankLabel = (rank?: number) => {
    if (!rank) return "Member";
    if (rank >= 80) return "Elite Agent";
    if (rank >= 60) return "Premium Agent";
    if (rank >= 40) return "Pro Agent";
    return "Agent";
  };

  const menuItems = [
    ...(member?.memberType === "AGENT"
      ? [
          {
            category: "properties",
            label: "Properties",
            icon: Home01Icon,
            count: member?.memberProperties || 0,
            section: "Details",
          },
        ]
      : []),
    {
      category: "followers",
      label: "Followers",
      icon: UserGroupIcon,
      count: member?.memberFollowers || 0,
      section: "Details",
    },
    {
      category: "followings",
      label: "Following",
      icon: UserAdd01Icon,
      count: member?.memberFollowings || 0,
      section: "Details",
    },
    {
      category: "articles",
      label: "Articles",
      icon: Notebook01Icon,
      count: member?.memberArticles || 0,
      section: "Community",
    },
  ];

  const detailsItems = menuItems.filter((i) => i.section === "Details");
  const communityItems = menuItems.filter((i) => i.section === "Community");

  if (MemberLoading) {
    return (
      <div
        className="rounded-2xl p-6 flex items-center justify-center h-40"
        style={{ background: "#fff", border: "1px solid #ebebeb" }}
      >
        <span className="w-7 h-7 border-[3px] border-[#ebebeb] border-t-[#F25912] rounded-full animate-spin" />
      </div>
    );
  }

  if (!member) return null;

  const NavSection = ({
    title,
    items,
  }: {
    title: string;
    items: typeof menuItems;
  }) => (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: "#fff", border: "1px solid #ebebeb" }}
    >
      <div
        style={{
          height: "3px",
          background:
            "linear-gradient(90deg, #F25912, #ff8c5a 40%, transparent)",
        }}
      />
      <div className="px-5 py-3.5">
        <span
          className="text-[10px] font-bold uppercase tracking-[0.16em]"
          style={{ color: "#F25912" }}
        >
          {title}
        </span>
      </div>
      <div style={{ height: "1px", background: "#ebebeb" }} />
      <nav className="p-2">
        {items.map((item) => {
          const isActive = category === item.category;
          return (
            <Link
              key={item.category}
              href={{
                pathname: "/member",
                query: { ...router.query, category: item.category },
              }}
              scroll={false}
            >
              <div
                className="flex items-center justify-between px-3 py-2.5 rounded-xl transition-all cursor-pointer"
                style={{
                  background: isActive ? "#222831" : "transparent",
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
                    size={16}
                    color={isActive ? "white" : "#9ca3af"}
                    strokeWidth={1.5}
                  />
                  <span className="text-sm font-semibold">{item.label}</span>
                </div>
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{
                    background: isActive ? "rgba(255,255,255,0.15)" : "#f3f4f6",
                    color: isActive ? "#fff" : "#6b7280",
                  }}
                >
                  {item.count}
                </span>
              </div>
            </Link>
          );
        })}
      </nav>
    </div>
  );

  return (
    <div className="sticky top-24 space-y-4">
      {/* ── Profile card ─────────────────────────────────────────────── */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: "#fff", border: "1px solid #ebebeb" }}
      >
        <div
          style={{
            height: "3px",
            background:
              "linear-gradient(90deg, #F25912, #ff8c5a 40%, transparent)",
          }}
        />

        <div className="p-6">
          {/* Avatar */}
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div
                className="w-20 h-20 rounded-full overflow-hidden"
                style={{ border: "3px solid #fff3ee" }}
              >
                {member.memberImage ? (
                  <img
                    src={getImageUrl(member.memberImage)}
                    alt={member.memberNick}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center"
                    style={{ background: "#f3f4f6" }}
                  >
                    <HugeiconsIcon
                      icon={UserIcon}
                      size={36}
                      color="#d1d5db"
                      strokeWidth={1.5}
                    />
                  </div>
                )}
              </div>
              {/* Active dot */}
              <span
                className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white"
                style={{ background: "#22c55e" }}
              />
            </div>
          </div>

          {/* Name */}
          <div className="text-center mb-4">
            <h2
              className="text-base font-extrabold mb-0.5"
              style={{ color: "#222831" }}
            >
              {member.memberNick}
            </h2>
            {member.memberFullName && (
              <p className="text-xs mb-2" style={{ color: "#9ca3af" }}>
                {member.memberFullName}
              </p>
            )}
            <span
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide"
              style={{ background: "#fff3ee", color: "#F25912" }}
            >
              <HugeiconsIcon
                icon={Award01Icon}
                size={10}
                color="#F25912"
                strokeWidth={2.5}
              />
              {member.memberType === "AGENT"
                ? getRankLabel(member.memberRank)
                : "Member"}
            </span>
          </div>

          {/* Phone */}
          {member.memberPhone && (
            <div className="flex items-center justify-center gap-1.5 mb-4">
              <HugeiconsIcon
                icon={CallIcon}
                size={13}
                color="#9ca3af"
                strokeWidth={1.5}
              />
              <span className="text-xs" style={{ color: "#6b7280" }}>
                {member.memberPhone}
              </span>
            </div>
          )}

          {/* Divider */}
          <div
            style={{
              height: "1px",
              background: "#f3f4f6",
              marginBottom: "16px",
            }}
          />

          {/* Follow button */}
          {isFollowing ? (
            <div className="space-y-2">
              <p
                className="text-center text-[11px] font-bold"
                style={{ color: "#22c55e" }}
              >
                ✓ Following
              </p>
              <button
                onClick={async () => {
                  setActionLoading(true);
                  try {
                    await unsubscribeHandler(member._id, getMemberRefetch);
                  } finally {
                    setActionLoading(false);
                  }
                }}
                disabled={actionLoading}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold border transition-all disabled:opacity-50"
                style={{
                  borderColor: "#fca5a5",
                  color: "#dc2626",
                  background: "#fef2f2",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#fee2e2")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "#fef2f2")
                }
              >
                {actionLoading ? (
                  <span className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <HugeiconsIcon
                    icon={UserRemove01Icon}
                    size={14}
                    color="currentColor"
                    strokeWidth={2}
                  />
                )}
                {actionLoading ? "Unfollowing…" : "Unfollow"}
              </button>
            </div>
          ) : (
            <button
              onClick={async () => {
                setActionLoading(true);
                try {
                  await subscribeHandler(member._id, getMemberRefetch);
                } finally {
                  setActionLoading(false);
                }
              }}
              disabled={actionLoading}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50"
              style={{
                background: "#F25912",
                boxShadow: "0 4px 14px rgba(242,89,18,0.28)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              {actionLoading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <HugeiconsIcon
                  icon={UserAdd01Icon}
                  size={14}
                  color="white"
                  strokeWidth={2.5}
                />
              )}
              {actionLoading ? "Following…" : "Follow"}
            </button>
          )}
        </div>
      </div>

      {/* ── Nav sections ─────────────────────────────────────────────── */}
      {detailsItems.length > 0 && (
        <NavSection title="Details" items={detailsItems} />
      )}
      {communityItems.length > 0 && (
        <NavSection title="Community" items={communityItems} />
      )}
    </div>
  );
};

export default MemberMenu;
