// ─── Shared design tokens & sub-components used by MemberFollowers / MemberFollowings ───
// (Keep in the same folder, not exported as a separate module — copy inline if needed)

import React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  UserIcon,
  FavouriteIcon,
  UserAdd01Icon,
  UserRemove01Icon,
} from "@hugeicons/core-free-icons";
import { getImageUrl } from "@/lib/utils";

// ── Pagination ────────────────────────────────────────────────────────────────
export const Pagination = ({
  currentPage,
  totalPages,
  total,
  limit,
  label,
  onPage,
}: {
  currentPage: number;
  totalPages: number;
  total: number;
  limit: number;
  label: string;
  onPage: (p: number) => void;
}) => {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1,
  );

  return (
    <div
      className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 mt-6"
      style={{ borderTop: "1px solid #ebebeb" }}
    >
      <p className="text-xs" style={{ color: "#9ca3af" }}>
        Showing {(currentPage - 1) * limit + 1}–
        {Math.min(currentPage * limit, total)} of {total} {label}
      </p>
      <div className="flex items-center gap-1.5">
        <PageBtn
          label="←"
          disabled={currentPage === 1}
          onClick={() => onPage(currentPage - 1)}
        />
        {pages.map((page, i, arr) => (
          <React.Fragment key={page}>
            {i > 0 && page - arr[i - 1] > 1 && (
              <span className="text-xs px-1" style={{ color: "#d1d5db" }}>
                …
              </span>
            )}
            <button
              onClick={() => onPage(page)}
              className="w-8 h-8 rounded-lg text-xs font-bold transition-all"
              style={{
                background: currentPage === page ? "#F25912" : "#fff",
                color: currentPage === page ? "#fff" : "#6b7280",
                border: `1px solid ${currentPage === page ? "#F25912" : "#ebebeb"}`,
              }}
            >
              {page}
            </button>
          </React.Fragment>
        ))}
        <PageBtn
          label="→"
          disabled={currentPage === totalPages}
          onClick={() => onPage(currentPage + 1)}
        />
      </div>
    </div>
  );
};

const PageBtn = ({
  label,
  disabled,
  onClick,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="w-8 h-8 rounded-lg text-xs font-bold transition-all disabled:opacity-30"
    style={{
      background: "#fff",
      border: "1px solid #ebebeb",
      color: "#6b7280",
    }}
  >
    {label}
  </button>
);

// ── Member row card ───────────────────────────────────────────────────────────
export const MemberRow = ({
  id,
  nick,
  fullName,
  image,
  followers,
  followings,
  likes,
  isLiked,
  isFollowing,
  isOwnProfile,
  onAvatarClick,
  onLike,
  onFollow,
  onUnfollow,
}: {
  id: string;
  nick: string;
  fullName?: string;
  image?: string;
  followers: number;
  followings: number;
  likes: number;
  isLiked: boolean;
  isFollowing: boolean;
  isOwnProfile: boolean;
  onAvatarClick: () => void;
  onLike: () => void;
  onFollow: () => void;
  onUnfollow: () => void;
}) => (
  <div
    className="rounded-2xl p-5 transition-all"
    style={{ background: "#fff", border: "1px solid #ebebeb" }}
    onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#d1d5db")}
    onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#ebebeb")}
  >
    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
      {/* Avatar + name */}
      <div
        className="flex items-center gap-3.5 flex-1 cursor-pointer"
        onClick={onAvatarClick}
      >
        <div
          className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0"
          style={{ border: "2px solid #fff3ee" }}
        >
          {image ? (
            <img
              src={getImageUrl(image)}
              alt={nick}
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{ background: "#f3f4f6" }}
            >
              <HugeiconsIcon
                icon={UserIcon}
                size={22}
                color="#d1d5db"
                strokeWidth={1.5}
              />
            </div>
          )}
        </div>
        <div className="min-w-0">
          <p
            className="text-sm font-extrabold truncate"
            style={{ color: "#222831" }}
          >
            {nick}
          </p>
          {fullName && (
            <p className="text-xs truncate" style={{ color: "#9ca3af" }}>
              {fullName}
            </p>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-5">
        <Stat label="Followers" value={followers} />
        <Stat label="Following" value={followings} />

        {/* Like */}
        <button
          onClick={onLike}
          className="text-center transition-transform hover:scale-110"
        >
          <div className="flex items-center gap-1 justify-center">
            <HugeiconsIcon
              icon={FavouriteIcon}
              size={16}
              color={isLiked ? "#ef4444" : "#d1d5db"}
              strokeWidth={isLiked ? 0 : 1.5}
            />
            <span
              className="text-sm font-extrabold"
              style={{ color: "#222831" }}
            >
              {likes}
            </span>
          </div>
          <p className="text-[10px]" style={{ color: "#9ca3af" }}>
            Likes
          </p>
        </button>
      </div>

      {/* Action */}
      {!isOwnProfile && (
        <div className="flex-shrink-0">
          {isFollowing ? (
            <div className="flex flex-col items-center gap-1">
              <span
                className="text-[10px] font-bold"
                style={{ color: "#22c55e" }}
              >
                ✓ Following
              </span>
              <button
                onClick={onUnfollow}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all"
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
                <HugeiconsIcon
                  icon={UserRemove01Icon}
                  size={13}
                  color="currentColor"
                  strokeWidth={2}
                />
                Unfollow
              </button>
            </div>
          ) : (
            <button
              onClick={onFollow}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white transition-all"
              style={{
                background: "#F25912",
                boxShadow: "0 3px 10px rgba(242,89,18,0.24)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              <HugeiconsIcon
                icon={UserAdd01Icon}
                size={13}
                color="white"
                strokeWidth={2.5}
              />
              Follow
            </button>
          )}
        </div>
      )}
    </div>
  </div>
);

const Stat = ({ label, value }: { label: string; value: number }) => (
  <div className="text-center">
    <p className="text-sm font-extrabold" style={{ color: "#222831" }}>
      {value}
    </p>
    <p className="text-[10px]" style={{ color: "#9ca3af" }}>
      {label}
    </p>
  </div>
);

// ── Section header ────────────────────────────────────────────────────────────
export const SectionHeader = ({
  eyebrow,
  title,
  count,
}: {
  eyebrow: string;
  title: string;
  count: number;
}) => (
  <div
    className="rounded-2xl overflow-hidden mb-5"
    style={{ background: "#fff", border: "1px solid #ebebeb" }}
  >
    <div
      style={{
        height: "3px",
        background: "linear-gradient(90deg, #F25912, #ff8c5a 40%, transparent)",
      }}
    />
    <div className="px-6 py-5 flex items-end justify-between">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div
            className="h-[2px] w-4 rounded"
            style={{ background: "#F25912" }}
          />
          <span
            className="text-[11px] font-bold uppercase tracking-[0.16em]"
            style={{ color: "#F25912" }}
          >
            {eyebrow}
          </span>
        </div>
        <h1 className="text-xl font-extrabold" style={{ color: "#222831" }}>
          {title}
        </h1>
      </div>
      <span
        className="text-sm font-bold px-3 py-1 rounded-full"
        style={{ background: "#f3f4f6", color: "#6b7280" }}
      >
        {count} total
      </span>
    </div>
  </div>
);

// ── Empty state ───────────────────────────────────────────────────────────────
export const EmptyState = ({
  icon,
  message,
  sub,
}: {
  icon: any;
  message: string;
  sub: string;
}) => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <div
      className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
      style={{ background: "#f3f4f6" }}
    >
      <HugeiconsIcon icon={icon} size={30} color="#d1d5db" strokeWidth={1.5} />
    </div>
    <p className="text-base font-bold mb-1" style={{ color: "#374151" }}>
      {message}
    </p>
    <p className="text-sm" style={{ color: "#9ca3af" }}>
      {sub}
    </p>
  </div>
);

// ── Spinner ───────────────────────────────────────────────────────────────────
export const Spinner = () => (
  <div className="flex items-center justify-center py-20">
    <span className="w-8 h-8 border-[3px] border-[#ebebeb] border-t-[#F25912] rounded-full animate-spin" />
  </div>
);
