import { NextPage } from "next";
import AdminLayout from "@/components/layouts/AdminLayout";
import { useQuery, useMutation } from "@apollo/client/react";
import { GET_COMMENTS } from "@/apollo/admin/query";
import { REMOVE_COMMENT_BY_ADMIN } from "@/apollo/admin/mutation";
import { Comment, Comments } from "@/lib/types/comment/comment";
import { CommentsInquiry } from "@/lib/types/comment/comment.input";

interface GetCommentsResponse {
  getComments: Comments;
}
import { Direction } from "@/lib/enums/common";
import { CommentGroup, CommentStatus } from "@/lib/enums/comment";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Search01Icon,
  Delete01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";

const statusColors: Record<CommentStatus, string> = {
  [CommentStatus.ACTIVE]: "bg-emerald-100 text-emerald-700",
  [CommentStatus.DELETE]: "bg-red-100 text-red-700",
};

const groupColors: Record<CommentGroup, string> = {
  [CommentGroup.PROPERTY]: "bg-blue-100 text-blue-700",
  [CommentGroup.ARTICLE]: "bg-violet-100 text-violet-700",
  [CommentGroup.MEMBER]: "bg-amber-100 text-amber-700",
  [CommentGroup.COMMENT]: "bg-slate-100 text-slate-600",
};

const AdminComments: NextPage = () => {
  const [refIdInput, setRefIdInput] = useState("");
  const [searchFilter, setSearchFilter] = useState<CommentsInquiry | null>(
    null,
  );
  const [comments, setComments] = useState<Comment[]>([]);
  const [total, setTotal] = useState(0);

  const { data, refetch } = useQuery<GetCommentsResponse>(GET_COMMENTS, {
    fetchPolicy: "network-only",
    variables: { input: searchFilter! },
    skip: !searchFilter,
  });
  console.log(data);

  const [removeComment] = useMutation(REMOVE_COMMENT_BY_ADMIN);

  // Sync local state whenever query data arrives
  useEffect(() => {
    if (data) {
      setComments(data?.getComments?.list ?? []);
      setTotal(data?.getComments?.metaCounter[0]?.total ?? 0);
    }
  }, [data]);

  // Refetch whenever searchFilter changes (page, new refId, etc.)
  useEffect(() => {
    if (searchFilter) refetch({ input: searchFilter });
  }, [searchFilter]);

  const totalPages = searchFilter ? Math.ceil(total / searchFilter.limit) : 0;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!refIdInput.trim()) return;
    setSearchFilter({
      page: 1,
      limit: 10,
      sort: "createdAt",
      direction: Direction.DESC,
      search: { commentRefId: refIdInput.trim() },
    });
  };

  const handlePage = (p: number) => {
    if (!searchFilter) return;
    setSearchFilter({ ...searchFilter, page: p });
  };

  const deleteHandler = async (id: string) => {
    if (!window.confirm("Delete this comment? This cannot be undone.")) return;
    try {
      await removeComment({ variables: { input: id } });
      await refetch();
      toast.success("Comment removed");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <AdminLayout title="Comments">
      {/* Ref ID search */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 mb-6">
        <p className="text-sm text-slate-500 mb-3">
          Enter a{" "}
          <span className="font-medium text-slate-700">Property ID</span> or{" "}
          <span className="font-medium text-slate-700">Article ID</span> to load
          its comments.
        </p>
        <form onSubmit={handleSearch} className="flex gap-2">
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
              value={refIdInput}
              onChange={(e) => setRefIdInput(e.target.value)}
              placeholder="e.g. 64a1f2c3b4e5d6f7a8b9c0d1"
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F25912]/40"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2 bg-[#F25912] text-white text-sm rounded-lg hover:bg-[#D94E0F] transition-colors"
          >
            Load Comments
          </button>
        </form>
        {searchFilter && (
          <p className="text-xs text-slate-400 mt-2">
            Showing comments for:{" "}
            <span className="font-mono text-slate-600">
              {searchFilter.search.commentRefId}
            </span>
            {" · "}
            {total} total
          </p>
        )}
      </div>

      {/* Table (only shown after a search) */}
      {searchFilter && (
        <>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    {[
                      "Content",
                      "Group",
                      "Status",
                      "Author",
                      "Created",
                      "Actions",
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
                  {comments.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-16 text-center text-slate-400"
                      >
                        No comments found for this ID
                      </td>
                    </tr>
                  ) : (
                    comments.map((c: Comment) => (
                      <tr
                        key={c._id}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <p className="text-slate-700 truncate max-w-72">
                            {c.commentContent}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${groupColors[c.commentGroup]}`}
                          >
                            {c.commentGroup}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[c.commentStatus]}`}
                          >
                            {c.commentStatus}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                          {c.memberData?.memberNick ?? "—"}
                        </td>
                        <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                          {new Date(c.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => deleteHandler(c._id)}
                            className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                            title="Delete comment"
                          >
                            <HugeiconsIcon
                              icon={Delete01Icon}
                              size={16}
                              color="currentColor"
                              strokeWidth={1.5}
                            />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                disabled={searchFilter.page === 1}
                onClick={() => handlePage(searchFilter.page - 1)}
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
                  onClick={() => handlePage(p)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                    p === searchFilter.page
                      ? "bg-[#222831] text-white"
                      : "border border-slate-200 hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                disabled={searchFilter.page === totalPages}
                onClick={() => handlePage(searchFilter.page + 1)}
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
        </>
      )}
    </AdminLayout>
  );
};

export default AdminComments;
