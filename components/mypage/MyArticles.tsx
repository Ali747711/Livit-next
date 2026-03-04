import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useQuery, useMutation, useReactiveVar } from "@apollo/client/react";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  EyeIcon,
  FavouriteIcon,
  PencilEdit01Icon,
  Delete01Icon,
  Notebook01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";
import { GET_BOARD_ARTICLES } from "@/apollo/user/query";
import { UPDATE_BOARD_ARTICLE } from "@/apollo/user/mutation";
import { userVar } from "@/apollo/store";
import {
  BoardArticle,
  BoardArticles,
} from "@/lib/types/board-article/board-article";
import { BoardArticlesInquiry } from "@/lib/types/board-article/board-article.input";
import { BoardArticleStatus } from "@/lib/enums/board-article";
import { Direction } from "@/lib/enums/common";

interface GetBoardArticlesResponse {
  getBoardArticles: BoardArticles;
}

const categoryColor: Record<string, { bg: string; color: string }> = {
  FREE: { bg: "#f0fdf4", color: "#16a34a" },
  RECOMMEND: { bg: "#faf5ff", color: "#7c3aed" },
  NEWS: { bg: "#fffbeb", color: "#d97706" },
  HUMOR: { bg: "#fdf2f8", color: "#db2777" },
};

const MyArticles: React.FC = () => {
  const router = useRouter();
  const user = useReactiveVar(userVar);

  const [articles, setArticles] = useState<BoardArticle[]>([]);
  const [total, setTotal] = useState(0);
  const [inquiry, setInquiry] = useState<BoardArticlesInquiry>({
    page: 1,
    limit: 8,
    sort: "createdAt",
    direction: Direction.DESC,
    search: { memberId: user._id },
  });

  const { data, loading, refetch } = useQuery<GetBoardArticlesResponse>(
    GET_BOARD_ARTICLES,
    {
      fetchPolicy: "network-only",
      skip: !user._id,
      variables: { input: inquiry },
      notifyOnNetworkStatusChange: true,
    },
  );

  const [updateBoardArticle] = useMutation(UPDATE_BOARD_ARTICLE);

  useEffect(() => {
    if (data?.getBoardArticles) {
      setArticles(data.getBoardArticles.list);
      setTotal(data.getBoardArticles.metaCounter[0]?.total ?? 0);
    }
  }, [data]);

  const totalPages = Math.ceil(total / inquiry.limit);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this article?")) return;
    try {
      await updateBoardArticle({
        variables: {
          input: { _id: id, articleStatus: BoardArticleStatus.DELETE },
        },
      });
      toast.success("Article deleted");
      await refetch({ input: inquiry });
    } catch (err: any) {
      toast.error(err.message || "Failed to delete");
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
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
        <div className="p-6 flex items-center justify-between">
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
                Community
              </span>
            </div>
            <h1 className="text-xl font-extrabold" style={{ color: "#222831" }}>
              My Articles{" "}
              <span
                className="text-base font-semibold"
                style={{ color: "#9ca3af" }}
              >
                ({total})
              </span>
            </h1>
          </div>
          <button
            onClick={() => router.push("/mypage?category=writeArticle")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold text-white transition-all"
            style={{
              background: "#F25912",
              boxShadow: "0 4px 14px rgba(242,89,18,0.28)",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            <HugeiconsIcon
              icon={PencilEdit01Icon}
              size={14}
              color="white"
              strokeWidth={2.5}
            />
            Write New
          </button>
        </div>
      </div>

      {/* Articles list */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: "#fff", border: "1px solid #ebebeb" }}
      >
        {loading ? (
          <div className="p-6 space-y-3">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-14 rounded-xl animate-pulse"
                style={{ background: "#f3f4f6" }}
              />
            ))}
          </div>
        ) : articles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: "#f3f4f6" }}
            >
              <HugeiconsIcon
                icon={Notebook01Icon}
                size={28}
                color="#d1d5db"
                strokeWidth={1}
              />
            </div>
            <p className="text-sm font-bold mb-1" style={{ color: "#374151" }}>
              No articles yet
            </p>
            <p className="text-xs mb-5" style={{ color: "#9ca3af" }}>
              Share your thoughts with the community
            </p>
            <button
              onClick={() => router.push("/mypage?category=writeArticle")}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold text-white"
              style={{ background: "#F25912" }}
            >
              <HugeiconsIcon
                icon={PencilEdit01Icon}
                size={14}
                color="white"
                strokeWidth={2.5}
              />
              Write Your First Article
            </button>
          </div>
        ) : (
          <div>
            {articles.map((article, i) => {
              const cat = categoryColor[article.articleCategory] ?? {
                bg: "#f3f4f6",
                color: "#6b7280",
              };
              return (
                <div
                  key={article._id}
                  className="flex items-center gap-4 px-5 py-4 transition-colors"
                  style={{
                    borderBottom:
                      i < articles.length - 1 ? "1px solid #f9fafb" : "none",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#fafafa")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  {/* Main info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="px-2 py-0.5 rounded text-[10px] font-bold uppercase"
                        style={{ background: cat.bg, color: cat.color }}
                      >
                        {article.articleCategory}
                      </span>
                      <span
                        className="px-2 py-0.5 rounded text-[10px] font-bold uppercase"
                        style={{
                          background:
                            article.articleStatus === BoardArticleStatus.ACTIVE
                              ? "#f0fdf4"
                              : "#fef2f2",
                          color:
                            article.articleStatus === BoardArticleStatus.ACTIVE
                              ? "#16a34a"
                              : "#ef4444",
                        }}
                      >
                        {article.articleStatus}
                      </span>
                    </div>
                    <p
                      className="text-sm font-semibold truncate cursor-pointer transition-colors"
                      style={{ color: "#222831" }}
                      onClick={() => router.push(`/community/${article._id}`)}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.color = "#F25912")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.color = "#222831")
                      }
                    >
                      {article.articleTitle}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "#9ca3af" }}>
                      {new Date(article.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>

                  {/* Stats */}
                  <div
                    className="hidden md:flex items-center gap-4 text-xs flex-shrink-0"
                    style={{ color: "#9ca3af" }}
                  >
                    <span className="flex items-center gap-1">
                      <HugeiconsIcon
                        icon={EyeIcon}
                        size={13}
                        color="currentColor"
                        strokeWidth={1.5}
                      />
                      {article.articleViews}
                    </span>
                    <span className="flex items-center gap-1">
                      <HugeiconsIcon
                        icon={FavouriteIcon}
                        size={13}
                        color="currentColor"
                        strokeWidth={1.5}
                      />
                      {article.articleLikes}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => router.push(`/community/${article._id}`)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                      style={{ color: "#9ca3af" }}
                      onMouseEnter={(e) => {
                        (
                          e.currentTarget as HTMLButtonElement
                        ).style.background = "#fff3ee";
                        (e.currentTarget as HTMLButtonElement).style.color =
                          "#F25912";
                      }}
                      onMouseLeave={(e) => {
                        (
                          e.currentTarget as HTMLButtonElement
                        ).style.background = "transparent";
                        (e.currentTarget as HTMLButtonElement).style.color =
                          "#9ca3af";
                      }}
                    >
                      <HugeiconsIcon
                        icon={EyeIcon}
                        size={15}
                        color="currentColor"
                        strokeWidth={1.5}
                      />
                    </button>
                    {article.articleStatus === BoardArticleStatus.ACTIVE && (
                      <button
                        onClick={() => handleDelete(article._id)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                        style={{ color: "#9ca3af" }}
                        onMouseEnter={(e) => {
                          (
                            e.currentTarget as HTMLButtonElement
                          ).style.background = "#fef2f2";
                          (e.currentTarget as HTMLButtonElement).style.color =
                            "#ef4444";
                        }}
                        onMouseLeave={(e) => {
                          (
                            e.currentTarget as HTMLButtonElement
                          ).style.background = "transparent";
                          (e.currentTarget as HTMLButtonElement).style.color =
                            "#9ca3af";
                        }}
                      >
                        <HugeiconsIcon
                          icon={Delete01Icon}
                          size={15}
                          color="currentColor"
                          strokeWidth={1.5}
                        />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1.5">
          <button
            disabled={inquiry.page === 1}
            onClick={() => setInquiry((f) => ({ ...f, page: f.page - 1 }))}
            className="p-2 rounded-lg border disabled:opacity-40"
            style={{ borderColor: "#ebebeb" }}
          >
            <HugeiconsIcon
              icon={ArrowLeft01Icon}
              size={15}
              color="#374151"
              strokeWidth={2}
            />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setInquiry((f) => ({ ...f, page: p }))}
              className="w-9 h-9 rounded-lg text-sm font-bold"
              style={{
                background: p === inquiry.page ? "#F25912" : "transparent",
                color: p === inquiry.page ? "#fff" : "#374151",
                border: p === inquiry.page ? "none" : "1px solid #ebebeb",
              }}
            >
              {p}
            </button>
          ))}
          <button
            disabled={inquiry.page === totalPages}
            onClick={() => setInquiry((f) => ({ ...f, page: f.page + 1 }))}
            className="p-2 rounded-lg border disabled:opacity-40"
            style={{ borderColor: "#ebebeb" }}
          >
            <HugeiconsIcon
              icon={ArrowRight01Icon}
              size={15}
              color="#374151"
              strokeWidth={2}
            />
          </button>
        </div>
      )}
    </div>
  );
};

export default MyArticles;
