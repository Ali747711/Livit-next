import { NextPage } from "next";
import AdminLayout from "@/components/layouts/AdminLayout";
import { useQuery, useMutation } from "@apollo/client/react";
import { GET_ALL_MEMBERS_BY_ADMIN } from "@/apollo/admin/query";
import { UPDATE_MEMBER_BY_ADMIN } from "@/apollo/admin/mutation";
import { Member } from "@/lib/types/member/member";
import { MembersInquiry } from "@/lib/types/member/member.input";
import { MemberStatus, MemberType } from "@/lib/enums/member";
import { Direction } from "@/lib/enums/common";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Search01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";
import MemberDetailModal from "@/components/admin/MemberDetailModal";
import { getImageUrl } from "@/lib/utils";

const statusColors: Record<MemberStatus, string> = {
  [MemberStatus.ACTIVE]: "bg-emerald-100 text-emerald-700",
  [MemberStatus.BLOCKED]: "bg-amber-100  text-amber-700",
  [MemberStatus.DELETE]: "bg-red-100    text-red-700",
};
const typeColors: Record<MemberType, string> = {
  [MemberType.USER]: "bg-blue-100   text-blue-700",
  [MemberType.AGENT]: "bg-violet-100 text-violet-700",
  [MemberType.ADMIN]: "bg-slate-100  text-slate-700",
};

const STATUS_TABS = ["ALL", ...Object.values(MemberStatus)] as const;

const defaultInquiry: MembersInquiry = {
  page: 1,
  limit: 10,
  sort: "createdAt",
  direction: Direction.DESC,
  search: {},
};

const AdminUsers: NextPage = () => {
  const [inquiry, setInquiry] = useState<MembersInquiry>(defaultInquiry);
  const [members, setMembers] = useState<Member[]>([]);
  const [total, setTotal] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  const { refetch, data } = useQuery<any>(GET_ALL_MEMBERS_BY_ADMIN, {
    fetchPolicy: "network-only",
    variables: { input: inquiry },
  });

  // IMAGE
  // const imageUrl = getImageUrl(mem)

  useEffect(() => {
    setMembers(data?.getAllMembersByAdmin?.list ?? []);
    setTotal(data?.getAllMembersByAdmin?.metaCounter[0]?.total ?? 0);
  }, [data]);

  const [updateMember] = useMutation(UPDATE_MEMBER_BY_ADMIN);

  // Refetch whenever inquiry changes
  useEffect(() => {
    refetch({ input: inquiry });
  }, [inquiry]);

  const totalPages = Math.ceil(total / inquiry.limit);

  /* ── handlers ── */
  const tabChangeHandler = (tab: string) => {
    setActiveTab(tab);
    setInquiry((prev) => ({
      ...prev,
      page: 1,
      search: {
        ...prev.search,
        memberStatus: tab === "ALL" ? undefined : (tab as MemberStatus),
      },
    }));
  };

  const searchHandler = (e: React.FormEvent) => {
    e.preventDefault();
    setInquiry((prev) => ({
      ...prev,
      page: 1,
      search: { ...prev.search, text: searchText.trim() || undefined },
    }));
  };

  const typeFilterHandler = (val: string) => {
    setInquiry((prev) => ({
      ...prev,
      page: 1,
      search: {
        ...prev.search,
        memberType: val ? (val as MemberType) : undefined,
      },
    }));
  };

  const pageHandler = (p: number) =>
    setInquiry((prev) => ({ ...prev, page: p }));

  const updateMemberHandler = async (
    id: string,
    field: "memberStatus" | "memberType",
    value: string,
  ) => {
    try {
      await updateMember({ variables: { input: { _id: id, [field]: value } } });
      await refetch({ input: inquiry });
      toast.success("Member updated");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <AdminLayout title="Users">
      {/* Status tabs */}
      <div className="flex gap-1 bg-white rounded-xl border border-slate-200 shadow-sm p-1 mb-6 w-fit">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => tabChangeHandler(tab)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab
                ? "bg-[#222831] text-white shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Search + type filter */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 mb-6 flex flex-wrap gap-3 items-center">
        <form
          onSubmit={searchHandler}
          className="flex gap-2 flex-1 min-w-[200px]"
        >
          <div className="relative flex-1">
            <HugeiconsIcon
              icon={Search01Icon}
              size={16}
              color="#94a3b8"
              strokeWidth={1.5}
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            />
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search by nick or name..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F25912]/40"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-[#F25912] text-white text-sm rounded-lg hover:bg-[#D94E0F] transition-colors"
          >
            Search
          </button>
        </form>

        <select
          onChange={(e) => typeFilterHandler(e.target.value)}
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F25912]/40 bg-white"
        >
          <option value="">All Types</option>
          {Object.values(MemberType).map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <span className="text-sm text-slate-500 ml-auto">{total} members</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {[
                  "Member",
                  "Type",
                  "Status",
                  "Props",
                  "Warn",
                  "Blocks",
                  "Joined",
                  "Change Type",
                  "Change Status",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {members.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-slate-400">
                    No members found
                  </td>
                </tr>
              ) : (
                members.map((m: Member) => {
                  const imageUrl = getImageUrl(m.memberImage);
                  return (
                    <tr
                      key={m._id}
                      onClick={() => setSelectedMember(m)}
                      className="hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      {/* Avatar + nick */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={imageUrl || "/img/profiles/avatardef.png"}
                            alt={m.memberNick}
                            className="w-8 h-8 rounded-full object-cover bg-slate-200 shrink-0"
                          />
                          <div>
                            <p className="font-medium text-slate-900 truncate max-w-[120px]">
                              {m.memberNick}
                            </p>
                            <p className="text-xs text-slate-400 truncate max-w-[120px]">
                              {m.memberFullName}
                            </p>
                          </div>
                        </div>
                      </td>
                      {/* Type badge */}
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${typeColors[m.memberType]}`}
                        >
                          {m.memberType}
                        </span>
                      </td>
                      {/* Status badge */}
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[m.memberStatus]}`}
                        >
                          {m.memberStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {m.memberProperties}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {m.memberWarnings}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {m.memberBlocks}
                      </td>
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                        {new Date(m.createdAt).toLocaleDateString()}
                      </td>
                      {/* Change Type — only shows OTHER types */}
                      <td
                        className="px-4 py-3"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <select
                          value=""
                          onChange={(e) => {
                            if (e.target.value)
                              updateMemberHandler(
                                m._id,
                                "memberType",
                                e.target.value,
                              );
                          }}
                          className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#F25912]/40 bg-white"
                        >
                          <option value="" disabled>
                            Set type…
                          </option>
                          {Object.values(MemberType)
                            .filter((t) => t !== m.memberType)
                            .map((t) => (
                              <option key={t} value={t}>
                                {t}
                              </option>
                            ))}
                        </select>
                      </td>
                      {/* Change Status — only shows OTHER statuses */}
                      <td
                        className="px-4 py-3"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <select
                          value=""
                          onChange={(e) => {
                            if (e.target.value)
                              updateMemberHandler(
                                m._id,
                                "memberStatus",
                                e.target.value,
                              );
                          }}
                          className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#F25912]/40 bg-white"
                        >
                          <option value="" disabled>
                            Set status…
                          </option>
                          {Object.values(MemberStatus)
                            .filter((s) => s !== m.memberStatus)
                            .map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                        </select>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            disabled={inquiry.page === 1}
            onClick={() => pageHandler(inquiry.page - 1)}
            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <HugeiconsIcon
              icon={ArrowLeft01Icon}
              size={16}
              color="currentColor"
              strokeWidth={2}
            />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => pageHandler(p)}
              className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                p === inquiry.page
                  ? "bg-[#222831] text-white"
                  : "border border-slate-200 hover:bg-slate-50 text-slate-700"
              }`}
            >
              {p}
            </button>
          ))}
          <button
            disabled={inquiry.page === totalPages}
            onClick={() => pageHandler(inquiry.page + 1)}
            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <HugeiconsIcon
              icon={ArrowRight01Icon}
              size={16}
              color="currentColor"
              strokeWidth={2}
            />
          </button>
        </div>
      )}
      <MemberDetailModal
        member={selectedMember}
        onClose={() => setSelectedMember(null)}
      />
    </AdminLayout>
  );
};

export default AdminUsers;
