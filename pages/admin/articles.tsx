import { NextPage } from "next";
import { useQuery, useMutation } from "@apollo/client/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import AdminLayout from "@/components/layouts/AdminLayout";
import ArticleDetailModal from "@/components/admin/ArticleDetailModal";
import { GET_ALL_BOARD_ARTICLES_BY_ADMIN } from "@/apollo/admin/query";
import {
  UPDATE_BOARD_ARTICLE_BY_ADMIN,
  REMOVE_BOARD_ARTICLE_BY_ADMIN,
} from "@/apollo/admin/mutation";
import { BoardArticle } from "@/lib/types/board-article/board-article";
import {
  BoardArticleCategory,
  BoardArticleStatus,
} from "@/lib/enums/board-article";
import { Direction } from "@/lib/enums/common";
import { getImageUrl } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Search01Icon,
  EyeIcon,
  FavouriteIcon,
  Delete02Icon,
  ViewIcon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  DocumentValidationIcon,
  CancelIcon,
  CheckmarkCircleIcon,
  Chat01Icon,
  StarIcon,
  NewsIcon,
  SmileIcon,
} from "@hugeicons/core-free-icons";

// ─── Constants ─────────────────────────────────────────────────────────────

const STATUS_TABS = [
  "ALL",
  BoardArticleStatus.ACTIVE,
  BoardArticleStatus.DELETE,
] as const;

const CATEGORY_TABS = [
  "ALL",
  BoardArticleCategory.FREE,
  BoardArticleCategory.RECOMMEND,
  BoardArticleCategory.NEWS,
  BoardArticleCategory.HUMOR,
] as const;

const categoryColors: Record<string, string> = {
  FREE: "bg-blue-50 text-blue-600 border-blue-200",
  RECOMMEND: "bg-violet-50 text-violet-600 border-violet-200",
  NEWS: "bg-amber-50 text-amber-600 border-amber-200",
  HUMOR: "bg-pink-50 text-pink-600 border-pink-200",
};

const categoryEmoji: Record<string, any> = {
  FREE: Chat01Icon,
  RECOMMEND: StarIcon,
  NEWS: NewsIcon,
  HUMOR: SmileIcon,
};

const statusConfig = {
  ACTIVE: {
    label: "Active",
    cls: "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100",
  },
  DELETE: {
    label: "Deleted",
    cls: "bg-red-50 text-red-500 border-red-200 hover:bg-red-100",
  },
};

const defaultInput = {
  page: 1,
  limit: 10,
  sort: "createdAt",
  direction: Direction.DESC,
  search: {} as Record<string, any>,
};

// ─── Page ──────────────────────────────────────────────────────────────────

const AdminArticles: NextPage = () => {
  const [inquiry, setInquiry] = useState(defaultInput);
  const [articles, setArticles] = useState<BoardArticle[]>([]);
  const [total, setTotal] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [statusTab, setStatusTab] = useState<string>("ALL");
  const [categoryTab, setCategoryTab] = useState<string>("ALL");
  const [selectedArticle, setSelectedArticle] = useState<BoardArticle | null>(
    null,
  );
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [mutating, setMutating] = useState<string | null>(null);

  // ── Apollo ────────────────────────────────────────────────────────────────

  const { data, refetch } = useQuery<any>(GET_ALL_BOARD_ARTICLES_BY_ADMIN, {
    fetchPolicy: "network-only",
    variables: { input: inquiry },
  });

  const [updateArticle] = useMutation(UPDATE_BOARD_ARTICLE_BY_ADMIN);
  const [removeArticle] = useMutation(REMOVE_BOARD_ARTICLE_BY_ADMIN);

  useEffect(() => {
    setArticles(data?.getAllBoardArticlesByAdmin?.list ?? []);
    setTotal(data?.getAllBoardArticlesByAdmin?.metaCounter[0]?.total ?? 0);
  }, [data]);

  // ── Handlers ─────────────────────────────────────────────────────────────

  const applyFilters = (
    page = 1,
    status = statusTab,
    category = categoryTab,
    text = searchText,
  ) => {
    const search: Record<string, any> = {};
    if (status !== "ALL") search.articleStatus = status;
    if (category !== "ALL") search.articleCategory = category;
    if (text.trim()) search.text = text.trim();
    setInquiry({ ...defaultInput, page, search });
  };

  const handleStatusTab = (s: string) => {
    setStatusTab(s);
    applyFilters(1, s, categoryTab, searchText);
  };

  const handleCategoryTab = (c: string) => {
    setCategoryTab(c);
    applyFilters(1, statusTab, c, searchText);
  };

  const handleSearch = () =>
    applyFilters(1, statusTab, categoryTab, searchText);

  const handlePage = (p: number) => {
    setInquiry((prev) => ({ ...prev, page: p }));
  };

  const handleStatusChange = async (
    article: BoardArticle,
    newStatus: BoardArticleStatus,
  ) => {
    setMutating(article._id);
    try {
      await updateArticle({
        variables: { input: { _id: article._id, articleStatus: newStatus } },
      });
      toast.success(`Article marked as ${newStatus.toLowerCase()}`);
      refetch();
    } catch {
      toast.error("Failed to update status");
    } finally {
      setMutating(null);
    }
  };

  const handleDelete = async (id: string) => {
    setMutating(id);
    console.log("ID: ", id);
    try {
      await removeArticle({ variables: { input: id } });
      toast.success("Article deleted");
      setDeletingId(null);
      refetch();
    } catch {
      toast.error("Failed to delete article");
    } finally {
      setMutating(null);
    }
  };

  const totalPages = Math.ceil(total / inquiry.limit);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <AdminLayout title="Articles">
      <div className="space-y-5">
        {/* ── Page header ── */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-800 leading-tight">
              Articles
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {total} total · manage community posts
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-slate-200 shadow-sm">
            <HugeiconsIcon
              icon={DocumentValidationIcon}
              size={16}
              color="#F25912"
              strokeWidth={1.5}
            />
            <span className="text-sm font-semibold text-slate-700">
              {total}
            </span>
            <span className="text-xs text-slate-400">articles</span>
          </div>
        </div>

        {/* ── Filters card ── */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 space-y-3">
          {/* Search row */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <HugeiconsIcon
                icon={Search01Icon}
                size={16}
                color="#94a3b8"
                strokeWidth={1.5}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              />
              <input
                type="text"
                placeholder="Search by title…"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F25912]/30 focus:border-[#F25912] transition-all bg-slate-50"
              />
            </div>
            <button
              onClick={handleSearch}
              className="px-5 py-2.5 bg-[#F25912] hover:bg-[#D94E0F] text-white text-sm font-semibold rounded-xl transition-colors shadow-sm shadow-[rgba(242,89,18,0.2)]"
            >
              Search
            </button>
          </div>

          {/* Status tabs */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-slate-400 font-medium mr-1">
              Status:
            </span>
            {STATUS_TABS.map((s) => (
              <button
                key={s}
                onClick={() => handleStatusTab(s)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                  statusTab === s
                    ? s === "ALL"
                      ? "bg-[#222831] text-white border-[#222831]"
                      : s === BoardArticleStatus.ACTIVE
                        ? "bg-emerald-600 text-white border-emerald-600"
                        : "bg-red-500 text-white border-red-500"
                    : "bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:text-slate-700"
                }`}
              >
                {s === "ALL" ? "All" : s === "ACTIVE" ? "Active" : "Deleted"}
              </button>
            ))}

            <div className="w-px h-4 bg-slate-200 mx-1" />

            {/* Category tabs */}
            <span className="text-xs text-slate-400 font-medium mr-1">
              Category:
            </span>
            {CATEGORY_TABS.map((c) => (
              <button
                key={c}
                onClick={() => handleCategoryTab(c)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                  categoryTab === c
                    ? "bg-[#222831] text-white border-[#222831]"
                    : "bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:text-slate-700"
                }`}
              >
                {c === "ALL" ? (
                  "All"
                ) : (
                  <HugeiconsIcon icon={categoryEmoji[c]} size={14} />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ── Table card ── */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide px-5 py-3.5 w-[38%]">
                  Article
                </th>
                <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide px-3 py-3.5">
                  Category
                </th>
                <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide px-3 py-3.5">
                  Status
                </th>
                <th className="text-center text-xs font-semibold text-slate-400 uppercase tracking-wide px-3 py-3.5">
                  Views
                </th>
                <th className="text-center text-xs font-semibold text-slate-400 uppercase tracking-wide px-3 py-3.5">
                  Likes
                </th>
                <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide px-3 py-3.5">
                  Author
                </th>
                <th className="text-right text-xs font-semibold text-slate-400 uppercase tracking-wide px-5 py-3.5">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-50">
              {articles.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="py-16 text-center text-slate-400 text-sm"
                  >
                    No articles found
                  </td>
                </tr>
              )}

              {articles.map((article) => {
                const isDeleting = deletingId === article._id;
                const isMutating = mutating === article._id;
                const thumb = article.articleImage
                  ? getImageUrl(article.articleImage)
                  : null;
                const authorImg = article.memberData?.memberImage
                  ? getImageUrl(article.memberData.memberImage)
                  : "/img/profiles/avatardef.png";
                const sc =
                  statusConfig[article.articleStatus] ?? statusConfig.ACTIVE;

                return (
                  <tr
                    onClick={() => setSelectedArticle(article)}
                    key={article._id}
                    className={`group transition-colors ${isMutating ? "opacity-50" : "hover:bg-slate-50/60"}`}
                  >
                    {/* Article thumb + title */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-slate-100">
                          {thumb ? (
                            <img
                              src={thumb}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                              <HugeiconsIcon
                                icon={
                                  categoryEmoji[article.articleCategory] ??
                                  Chat01Icon
                                }
                                size={20}
                                color="currentColor"
                                strokeWidth={1.5}
                              />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-800 line-clamp-1 leading-tight">
                            {article.articleTitle}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {new Date(article.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              },
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Inline delete confirmation */}
                      {isDeleting && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="mt-2 flex items-center gap-2 p-2 bg-red-50 rounded-lg border border-red-200"
                        >
                          <span className="text-xs text-red-600 font-medium flex-1">
                            Delete permanently?
                          </span>
                          <button
                            onClick={() => setDeletingId(null)}
                            className="px-2.5 py-1 text-xs rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors font-medium"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleDelete(article._id)}
                            disabled={isMutating}
                            className="px-2.5 py-1 text-xs rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors font-medium disabled:opacity-50"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </td>

                    {/* Category */}
                    <td className="px-3 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${categoryColors[article.articleCategory] ?? "bg-slate-50 text-slate-600 border-slate-200"}`}
                      >
                        <HugeiconsIcon
                          icon={
                            categoryEmoji[article.articleCategory] ?? Chat01Icon
                          }
                          size={12}
                          color="currentColor"
                          strokeWidth={1.5}
                        />{" "}
                        {article.articleCategory}
                      </span>
                    </td>

                    {/* Status — dropdown */}
                    <td className="px-3 py-3.5">
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="flex flex-row gap-1.5"
                      >
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border w-fit ${sc.cls.replace("hover:bg-emerald-100", "").replace("hover:bg-red-100", "")}`}
                        >
                          {article.articleStatus ===
                          BoardArticleStatus.ACTIVE ? (
                            <HugeiconsIcon
                              icon={CheckmarkCircleIcon}
                              size={13}
                              color="currentColor"
                              strokeWidth={1.5}
                            />
                          ) : (
                            <HugeiconsIcon
                              icon={CancelIcon}
                              size={13}
                              color="currentColor"
                              strokeWidth={1.5}
                            />
                          )}
                          {sc.label}
                        </span>
                        <select
                          value=""
                          disabled={isMutating}
                          onChange={(e) => {
                            if (e.target.value)
                              handleStatusChange(
                                article,
                                e.target.value as BoardArticleStatus,
                              );
                          }}
                          className="text-xs border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#F25912]/30 bg-white disabled:opacity-50 cursor-pointer"
                        >
                          <option value="" disabled>
                            Set status…
                          </option>
                          {Object.values(BoardArticleStatus)
                            .filter((s) => s !== article.articleStatus)
                            .map((s) => (
                              <option key={s} value={s}>
                                {s === BoardArticleStatus.ACTIVE
                                  ? "Active"
                                  : "Deleted"}
                              </option>
                            ))}
                        </select>
                      </div>
                    </td>

                    {/* Views */}
                    <td className="px-3 py-3.5 text-center">
                      <div className="inline-flex items-center gap-1 text-slate-500">
                        <HugeiconsIcon
                          icon={EyeIcon}
                          size={13}
                          color="currentColor"
                          strokeWidth={1.5}
                        />
                        <span className="text-xs font-medium">
                          {article.articleViews}
                        </span>
                      </div>
                    </td>

                    {/* Likes */}
                    <td className="px-3 py-3.5 text-center">
                      <div className="inline-flex items-center gap-1 text-slate-500">
                        <HugeiconsIcon
                          icon={FavouriteIcon}
                          size={13}
                          color="currentColor"
                          strokeWidth={1.5}
                        />
                        <span className="text-xs font-medium">
                          {article.articleLikes}
                        </span>
                      </div>
                    </td>

                    {/* Author */}
                    <td className="px-3 py-3.5">
                      <div className="flex items-center gap-2">
                        <img
                          src={authorImg}
                          alt={article.memberData?.memberNick ?? ""}
                          className="w-7 h-7 rounded-full object-cover border border-slate-100 shrink-0"
                        />
                        <span className="text-xs font-medium text-slate-600 truncate max-w-[80px]">
                          {article.memberData?.memberNick ?? "—"}
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        {/* View */}
                        <button
                          onClick={() => setSelectedArticle(article)}
                          title="Preview article"
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-[#F25912] hover:bg-[#FEF0E9] transition-colors"
                        >
                          <HugeiconsIcon
                            icon={ViewIcon}
                            size={16}
                            color="currentColor"
                            strokeWidth={1.5}
                          />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletingId(isDeleting ? null : article._id);
                          }}
                          title="Delete article"
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <HugeiconsIcon
                            icon={Delete02Icon}
                            size={16}
                            color="currentColor"
                            strokeWidth={1.5}
                          />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-1.5">
            <button
              disabled={inquiry.page === 1}
              onClick={() => handlePage(inquiry.page - 1)}
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <HugeiconsIcon
                icon={ArrowLeft01Icon}
                size={15}
                color="currentColor"
                strokeWidth={2}
              />
            </button>

            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              let p: number;
              if (totalPages <= 7) p = i + 1;
              else if (inquiry.page <= 4) p = i + 1;
              else if (inquiry.page >= totalPages - 3) p = totalPages - 6 + i;
              else p = inquiry.page - 3 + i;

              return (
                <button
                  key={p}
                  onClick={() => handlePage(p)}
                  className={`w-9 h-9 rounded-xl text-sm font-semibold transition-colors border ${
                    p === inquiry.page
                      ? "bg-[#222831] text-white border-[#222831] shadow-sm shadow-[rgba(34,40,49,0.15)]"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {p}
                </button>
              );
            })}

            <button
              disabled={inquiry.page === totalPages}
              onClick={() => handlePage(inquiry.page + 1)}
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <HugeiconsIcon
                icon={ArrowRight01Icon}
                size={15}
                color="currentColor"
                strokeWidth={2}
              />
            </button>
          </div>
        )}
      </div>

      {/* ── Article detail modal ── */}
      {selectedArticle && (
        <ArticleDetailModal
          article={selectedArticle}
          onClose={() => setSelectedArticle(null)}
        />
      )}
    </AdminLayout>
  );
};

export default AdminArticles;
