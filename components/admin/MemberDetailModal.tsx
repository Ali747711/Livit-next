import { Member } from "@/lib/types/member/member";
import { MemberStatus, MemberType } from "@/lib/enums/member";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Cancel01Icon,
  UserIcon,
  Location01Icon,
  PhoneArrowDownIcon,
} from "@hugeicons/core-free-icons";
import { getImageUrl } from "@/lib/utils";

interface Props {
  member: Member | null;
  onClose: () => void;
}

const statusColors: Record<MemberStatus, string> = {
  [MemberStatus.ACTIVE]: "bg-emerald-100 text-emerald-700",
  [MemberStatus.BLOCKED]: "bg-amber-100   text-amber-700",
  [MemberStatus.DELETE]: "bg-red-100     text-red-700",
};
const typeColors: Record<MemberType, string> = {
  [MemberType.USER]: "bg-blue-100   text-blue-700",
  [MemberType.AGENT]: "bg-violet-100 text-violet-700",
  [MemberType.ADMIN]: "bg-slate-100  text-slate-700",
};

const Stat = ({ label, value }: { label: string; value: number | string }) => (
  <div className="bg-slate-50 rounded-xl p-3 text-center">
    <p className="text-lg font-bold text-slate-900">{value}</p>
    <p className="text-xs text-slate-500 mt-0.5">{label}</p>
  </div>
);

export default function MemberDetailModal({ member, onClose }: Props) {
  if (!member) return null;

  // Image
  const imageUrl = getImageUrl(member.memberImage);
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-900">
            Member Details
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-500"
          >
            <HugeiconsIcon
              icon={Cancel01Icon}
              size={18}
              color="currentColor"
              strokeWidth={2}
            />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Avatar + name */}
          <div className="flex items-center gap-4">
            {member.memberImage ? (
              <img
                src={imageUrl}
                alt={member.memberNick}
                className="w-16 h-16 rounded-2xl object-cover bg-slate-100 shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center shrink-0">
                <HugeiconsIcon
                  icon={UserIcon}
                  size={28}
                  color="#94a3b8"
                  strokeWidth={1.5}
                />
              </div>
            )}
            <div className="min-w-0">
              <p className="font-semibold text-slate-900 truncate">
                {member.memberFullName || member.memberNick}
              </p>
              <p className="text-sm text-slate-500">@{member.memberNick}</p>
              <div className="flex gap-2 mt-1.5">
                <span
                  className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${typeColors[member.memberType]}`}
                >
                  {member.memberType}
                </span>
                <span
                  className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[member.memberStatus]}`}
                >
                  {member.memberStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Contact
            </p>
            <div className="flex items-center gap-3 text-sm text-slate-700">
              <HugeiconsIcon
                icon={PhoneArrowDownIcon}
                size={15}
                color="#94a3b8"
                strokeWidth={1.5}
              />
              <span>{member.memberPhone || "—"}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-700">
              <HugeiconsIcon
                icon={Location01Icon}
                size={15}
                color="#94a3b8"
                strokeWidth={1.5}
              />
              <span>{member.memberAddress || "—"}</span>
            </div>
          </div>

          {/* Bio */}
          {member.memberDesc && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                About
              </p>
              <p className="text-sm text-slate-700 leading-relaxed">
                {member.memberDesc}
              </p>
            </div>
          )}

          {/* Stats grid */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Activity
            </p>
            <div className="grid grid-cols-3 gap-2">
              <Stat label="Properties" value={member.memberProperties} />
              <Stat label="Articles" value={member.memberArticles} />
              <Stat label="Points" value={member.memberPoints} />
              <Stat label="Likes" value={member.memberLikes} />
              <Stat label="Views" value={member.memberViews} />
              <Stat label="Rank" value={member.memberRank} />
            </div>
          </div>

          {/* Moderation */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Moderation
            </p>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center justify-between bg-amber-50 rounded-xl px-4 py-3">
                <span className="text-sm text-amber-700">Warnings</span>
                <span className="font-bold text-amber-800">
                  {member.memberWarnings}
                </span>
              </div>
              <div className="flex items-center justify-between bg-red-50 rounded-xl px-4 py-3">
                <span className="text-sm text-red-700">Blocks</span>
                <span className="font-bold text-red-800">
                  {member.memberBlocks}
                </span>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Timestamps
            </p>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Joined</span>
                <span className="text-slate-700">
                  {new Date(member.createdAt).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Updated</span>
                <span className="text-slate-700">
                  {new Date(member.updatedAt).toLocaleString()}
                </span>
              </div>
              {member.deletedAt && (
                <div className="flex justify-between">
                  <span className="text-red-500">Deleted</span>
                  <span className="text-red-600">
                    {new Date(member.deletedAt).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* ID */}
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              ID
            </p>
            <p className="text-xs font-mono text-slate-500 break-all bg-slate-50 px-3 py-2 rounded-lg">
              {member._id}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
