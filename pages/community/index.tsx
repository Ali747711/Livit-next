import { NextPage } from "next";
import { useRouter } from "next/router";
import React, { useState, useEffect } from "react";
import { useQuery, useReactiveVar } from "@apollo/client/react";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Search01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  EyeIcon,
  FavouriteIcon,
  MessageIcon,
  PencilEdit01Icon,
  Calendar01Icon,
} from "@hugeicons/core-free-icons";
import { GET_BOARD_ARTICLES } from "@/apollo/user/query";
import { userVar } from "@/apollo/store";
import {
  BoardArticle,
  BoardArticles,
} from "@/lib/types/board-article/board-article";
import { BoardArticlesInquiry } from "@/lib/types/board-article/board-article.input";
import { BoardArticleCategory } from "@/lib/enums/board-article";
import { Direction } from "@/lib/enums/common";
import { getImageUrl } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface GetBoardArticlesResponse {
  getBoardArticles: BoardArticles;
}

const CATEGORIES = [
  { value: "all", label: "All" },
  { value: BoardArticleCategory.FREE, label: "Free" },
  { value: BoardArticleCategory.RECOMMEND, label: "Recommend" },
  { value: BoardArticleCategory.NEWS, label: "News" },
  { value: BoardArticleCategory.HUMOR, label: "Humor" },
];

const SORT_OPTIONS = [
  { value: "createdAt", label: "Newest" },
  { value: "articleLikes", label: "Most Liked" },
  { value: "articleViews", label: "Most Viewed" },
];

const categoryMeta: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  FREE: { label: "Free", color: "#2563eb", bg: "#eff6ff" },
  RECOMMEND: { label: "Recommend", color: "#7c3aed", bg: "#f5f3ff" },
  NEWS: { label: "News", color: "#d97706", bg: "#fffbeb" },
  HUMOR: { label: "Humor", color: "#db2777", bg: "#fdf2f8" },
};

const defaultInput: BoardArticlesInquiry = {
  page: 1,
  limit: 9,
  sort: "createdAt",
  direction: Direction.DESC,
  search: {},
};

const Community: NextPage = () => {
  const router = useRouter();
  const user = useReactiveVar(userVar);

  const [inquiry, setInquiry] = useState<BoardArticlesInquiry>(defaultInput);
  const [searchText, setSearchText] = useState("");
  const [articles, setArticles] = useState<BoardArticle[]>([]);
  const [total, setTotal] = useState(0);

  const { data, loading, refetch } = useQuery<GetBoardArticlesResponse>(
    GET_BOARD_ARTICLES,
    {
      fetchPolicy: "network-only",
      variables: { input: inquiry },
      notifyOnNetworkStatusChange: true,
    },
  );

  useEffect(() => {
    if (data?.getBoardArticles) {
      setArticles(data.getBoardArticles.list);
      setTotal(data.getBoardArticles.metaCounter[0]?.total ?? 0);
    }
  }, [data]);

  useEffect(() => {
    refetch({ input: inquiry });
  }, [inquiry]);

  const totalPages = Math.ceil(total / inquiry.limit);

  const handleCategory = (cat: string) => {
    setInquiry({
      ...inquiry,
      page: 1,
      search: {
        ...inquiry.search,
        articleCategory:
          cat === "all" ? undefined : (cat as BoardArticleCategory),
      },
    });
  };

  const handleSort = (sort: string) => {
    setInquiry({ ...inquiry, page: 1, sort });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setInquiry({
      ...inquiry,
      page: 1,
      search: { ...inquiry.search, text: searchText.trim() || undefined },
    });
  };

  const handlePage = (page: number) => {
    setInquiry({ ...inquiry, page });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleWriteClick = () => {
    if (!user._id) {
      toast.error("Please login to write an article");
      return;
    }
    router.push("/mypage?category=writeArticle");
  };

  const activeCategory = (inquiry.search as any).articleCategory ?? "all";

  return (
    <div className="min-h-screen" style={{ background: "#f7f7f5" }}>
      {/* ── Hero ────────────────────────────────────────────────────── */}
      <div
        className="relative -mt-16 pt-48 pb-16 overflow-hidden"
        style={{ background: "#222831" }}
      >
        {/* dot-grid texture */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        {/* left orange accent bar */}
        {/* <div
          className="absolute left-0 top-16 bottom-0 w-[3px] rounded-r-full"
          style={{
            background:
              "linear-gradient(to bottom, #F25912 0%, transparent 80%)",
          }}
        /> */}

        <div className="container mx-auto px-6 max-w-6xl relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-5">
                <div
                  className="h-[2px] w-8 rounded"
                  style={{ background: "#F25912" }}
                />
                <span
                  className="text-[11px] font-bold uppercase tracking-[0.18em]"
                  style={{ color: "#F25912" }}
                >
                  Community Board
                </span>
              </div>
              <h1 className="text-4xl md:text-[52px] font-extrabold text-white leading-[1.1] mb-4">
                Share &amp; Discuss
              </h1>
              <p
                style={{ color: "rgba(255,255,255,0.45)" }}
                className="text-base max-w-md"
              >
                Ideas, tips, and discussions with fellow community members
              </p>
            </div>

            <Button
              onClick={handleWriteClick}
              className="hidden md:inline-flex rounded-full bg-[#F25912] hover:bg-[#D94E0F] border-0 gap-2.5 font-bold text-sm shrink-0"
              size="lg"
            >
              <HugeiconsIcon
                icon={PencilEdit01Icon}
                size={16}
                color="white"
                strokeWidth={2.5}
              />
              Write Article
            </Button>
          </div>
        </div>
      </div>

      {/* ── Sticky Toolbar ─────────────────────────────────────────── */}
      <div
        className="sticky top-0 z-30"
        style={{ background: "#fff", borderBottom: "1px solid #ebebeb" }}
      >
        <div className="container mx-auto px-6 max-w-6xl py-3">
          <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
            {/* Category Tabs */}
            <Tabs value={activeCategory} onValueChange={handleCategory}>
              <TabsList className="bg-transparent p-0 h-auto gap-2 flex-wrap">
                {CATEGORIES.map((cat) => (
                  <TabsTrigger
                    key={cat.value}
                    value={cat.value}
                    className="rounded-full border border-[#e5e7eb] text-[#6b7280] px-4 py-1.5 text-sm font-semibold h-auto
                      data-[state=active]:bg-[#222831] data-[state=active]:text-white data-[state=active]:border-[#222831]
                      data-[state=active]:shadow-none hover:text-[#222831] hover:border-[#222831] transition-all
                      focus-visible:ring-[#F25912]"
                  >
                    {cat.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            <div className="flex mt-10 sm:mt-0 items-center gap-3 md:ml-auto">
              {/* Sort Select */}
              <Select value={inquiry.sort} onValueChange={handleSort}>
                <SelectTrigger className="w-36 rounded-lg border-[#e5e7eb] text-sm h-9 text-[#374151] focus:ring-[#F25912]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Search */}
              <form
                onSubmit={handleSearch}
                className="flex items-center rounded-full overflow-hidden border border-[#e5e7eb]"
              >
                <div className="relative">
                  <HugeiconsIcon
                    icon={Search01Icon}
                    size={13}
                    color="#9ca3af"
                    strokeWidth={1.5}
                    className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  />
                  <Input
                    type="text"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    placeholder="Search articles..."
                    className="pl-8 pr-3 h-9 w-36 rounded-none border-0 focus-visible:ring-0 text-sm bg-transparent shadow-none"
                  />
                </div>
                <Button
                  type="submit"
                  size="sm"
                  className="rounded-none rounded-r-full bg-[#F25912] hover:bg-[#D94E0F] border-0 h-9 px-4 text-sm font-bold"
                >
                  Go
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* ── Content ─────────────────────────────────────────────────── */}
      <div className="container mx-auto px-6 max-w-6xl py-10">
        <div className="flex items-center justify-between mb-7">
          <p className="text-sm" style={{ color: "#9ca3af" }}>
            <span className="font-bold" style={{ color: "#222831" }}>
              {total}
            </span>{" "}
            article{total !== 1 ? "s" : ""} found
          </p>
        </div>

        {loading ? (
          <BentoSkeleton />
        ) : articles.length === 0 ? (
          <EmptyState onWrite={handleWriteClick} />
        ) : (
          <BentoGrid
            articles={articles}
            onCardClick={(id) => router.push(`/community/${id}`)}
          />
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-12">
            <Button
              variant="outline"
              size="sm"
              disabled={inquiry.page === 1}
              onClick={() => handlePage(inquiry.page - 1)}
              className="rounded-full gap-1 border-[#e5e7eb] text-[#374151] disabled:opacity-30"
            >
              <HugeiconsIcon
                icon={ArrowLeft01Icon}
                size={13}
                color="currentColor"
                strokeWidth={2}
              />
              Prev
            </Button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Button
                key={p}
                variant={p === inquiry.page ? "default" : "outline"}
                size="icon"
                onClick={() => handlePage(p)}
                className="rounded-full w-9 h-9 text-sm font-bold border-[#e5e7eb]"
                style={
                  p === inquiry.page
                    ? { background: "#F25912", borderColor: "#F25912" }
                    : { color: "#6b7280" }
                }
              >
                {p}
              </Button>
            ))}

            <Button
              variant="outline"
              size="sm"
              disabled={inquiry.page === totalPages}
              onClick={() => handlePage(inquiry.page + 1)}
              className="rounded-full gap-1 border-[#e5e7eb] text-[#374151] disabled:opacity-30"
            >
              Next
              <HugeiconsIcon
                icon={ArrowRight01Icon}
                size={13}
                color="currentColor"
                strokeWidth={2}
              />
            </Button>
          </div>
        )}
      </div>

      {/* Mobile FAB */}
      <Button
        onClick={handleWriteClick}
        className="fixed bottom-6 right-6 md:hidden rounded-full bg-[#F25912] hover:bg-[#D94E0F] border-0 gap-2 px-5 py-3 font-bold shadow-[0_4px_20px_rgba(242,89,18,0.4)]"
      >
        <HugeiconsIcon
          icon={PencilEdit01Icon}
          size={18}
          color="white"
          strokeWidth={2.5}
        />
        Write
      </Button>
    </div>
  );
};

// ─── Bento Grid Layout ────────────────────────────────────────────────────────
const BentoGrid: React.FC<{
  articles: BoardArticle[];
  onCardClick: (id: string) => void;
}> = ({ articles, onCardClick }) => {
  const [hero, ...rest] = articles;

  return (
    <div className="space-y-4">
      {/* Row 1: Hero (2 cols) + 2 small stacked */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <ArticleCard
            article={hero}
            onClick={() => onCardClick(hero._id)}
            size="hero"
          />
        </div>
        <div className="flex flex-col gap-4">
          {rest.slice(0, 2).map((a) => (
            <ArticleCard
              key={a._id}
              article={a}
              onClick={() => onCardClick(a._id)}
              size="small"
            />
          ))}
        </div>
      </div>

      {/* Row 2+: Equal 3-col grid */}
      {rest.length > 2 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {rest.slice(2).map((a) => (
            <ArticleCard
              key={a._id}
              article={a}
              onClick={() => onCardClick(a._id)}
              size="medium"
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Article Card ─────────────────────────────────────────────────────────────
interface ArticleCardProps {
  article: BoardArticle;
  onClick: () => void;
  size: "hero" | "small" | "medium";
}

const ArticleCard: React.FC<ArticleCardProps> = ({
  article,
  onClick,
  size,
}) => {
  const authorImage = article.memberData?.memberImage
    ? getImageUrl(article.memberData.memberImage)
    : "/img/profile/defaultUser.svg";
  const meta = categoryMeta[article.articleCategory];

  // ── Hero card: full image with overlay text ──────────────────────────
  if (size === "hero") {
    return (
      <div
        onClick={onClick}
        className="group relative rounded-2xl overflow-hidden cursor-pointer"
        style={{ height: "420px" }}
      >
        {article.articleImage ? (
          <img
            src={getImageUrl(article.articleImage)}
            alt={article.articleTitle}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(135deg, #222831, #2d3a45)" }}
          />
        )}
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
        {/* Hover tint */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />

        <div className="absolute bottom-0 left-0 right-0 p-7">
          {meta && (
            <span
              className="inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mb-3"
              style={{ background: "#F25912", color: "#fff" }}
            >
              {meta.label}
            </span>
          )}
          <h2 className="text-white text-[22px] font-extrabold leading-tight mb-3 line-clamp-3 group-hover:text-orange-100 transition-colors">
            {article.articleTitle}
          </h2>
          <p className="text-white/55 text-sm line-clamp-2 mb-4">
            {article.articleContent}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img
                src={authorImage}
                alt={article.memberData?.memberNick ?? "User"}
                className="w-7 h-7 rounded-full object-cover ring-1 ring-white/30"
              />
              <span className="text-white/65 text-xs font-medium">
                {article.memberData?.memberNick ?? "Unknown"}
              </span>
            </div>
            <div className="flex items-center gap-3 text-white/45 text-xs">
              <span className="flex items-center gap-1">
                <HugeiconsIcon
                  icon={EyeIcon}
                  size={12}
                  color="currentColor"
                  strokeWidth={1.5}
                />
                {article.articleViews}
              </span>
              <span className="flex items-center gap-1">
                <HugeiconsIcon
                  icon={FavouriteIcon}
                  size={12}
                  color="currentColor"
                  strokeWidth={1.5}
                />
                {article.articleLikes}
              </span>
              <span className="flex items-center gap-1">
                <HugeiconsIcon
                  icon={Calendar01Icon}
                  size={12}
                  color="currentColor"
                  strokeWidth={1.5}
                />
                {new Date(article.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Small card (stacked in sidebar) ─────────────────────────────────
  if (size === "small") {
    return (
      <div
        onClick={onClick}
        className="group relative rounded-xl overflow-hidden cursor-pointer flex-1"
        style={{ minHeight: "196px" }}
      >
        {article.articleImage ? (
          <img
            src={getImageUrl(article.articleImage)}
            alt={article.articleTitle}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-400"
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(135deg, #1e2630, #2a3440)" }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-4">
          {meta && (
            <span
              className="inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide mb-1.5"
              style={{ background: "#F25912", color: "#fff" }}
            >
              {meta.label}
            </span>
          )}
          <h3 className="text-white text-sm font-bold line-clamp-2 group-hover:text-orange-100 transition-colors">
            {article.articleTitle}
          </h3>
          <div className="flex items-center gap-2 mt-2 text-white/45 text-[11px]">
            <span className="flex items-center gap-0.5">
              <HugeiconsIcon
                icon={EyeIcon}
                size={10}
                color="currentColor"
                strokeWidth={1.5}
              />
              {article.articleViews}
            </span>
            <span className="flex items-center gap-0.5">
              <HugeiconsIcon
                icon={FavouriteIcon}
                size={10}
                color="currentColor"
                strokeWidth={1.5}
              />
              {article.articleLikes}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // ── Medium card (equal grid) ─────────────────────────────────────────
  return (
    <div
      onClick={onClick}
      className="group bg-white rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl flex flex-col"
      style={{ border: "1px solid #ebebeb" }}
    >
      <div className="relative overflow-hidden" style={{ height: "168px" }}>
        {article.articleImage ? (
          <img
            src={getImageUrl(article.articleImage)}
            alt={article.articleTitle}
            className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-400"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #f3f4f6, #ebebea)" }}
          >
            <HugeiconsIcon
              icon={MessageIcon}
              size={30}
              color="#d1d5db"
              strokeWidth={1}
            />
          </div>
        )}
        {meta && (
          <span
            className="absolute top-3 left-3 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide"
            style={{ background: "#F25912", color: "#fff" }}
          >
            {meta.label}
          </span>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3
          className="font-bold text-[15px] leading-snug mb-2 line-clamp-2 transition-colors group-hover:text-orange-500"
          style={{ color: "#222831" }}
        >
          {article.articleTitle}
        </h3>
        <p
          className="text-sm line-clamp-2 mb-auto"
          style={{ color: "#9ca3af" }}
        >
          {article.articleContent}
        </p>

        <div
          className="flex items-center justify-between mt-3 pt-3"
          style={{ borderTop: "1px solid #f3f4f6" }}
        >
          <div className="flex items-center gap-1.5">
            <img
              src={authorImage}
              alt={article.memberData?.memberNick ?? "User"}
              className="w-6 h-6 rounded-full object-cover"
            />
            <span className="text-xs font-medium" style={{ color: "#6b7280" }}>
              {article.memberData?.memberNick ?? "Unknown"}
            </span>
          </div>
          <div className="flex items-center gap-2" style={{ color: "#d1d5db" }}>
            <span className="flex items-center gap-0.5 text-xs">
              <HugeiconsIcon
                icon={EyeIcon}
                size={11}
                color="currentColor"
                strokeWidth={1.5}
              />
              {article.articleViews}
            </span>
            <span className="flex items-center gap-0.5 text-xs">
              <HugeiconsIcon
                icon={FavouriteIcon}
                size={11}
                color="currentColor"
                strokeWidth={1.5}
              />
              {article.articleLikes}
            </span>
            <span className="flex items-center gap-0.5 text-xs">
              <HugeiconsIcon
                icon={Calendar01Icon}
                size={11}
                color="currentColor"
                strokeWidth={1.5}
              />
              {new Date(article.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const BentoSkeleton = () => (
  <div className="space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div
        className="md:col-span-2 rounded-2xl animate-pulse bg-gray-200"
        style={{ height: "420px" }}
      />
      <div className="flex flex-col gap-4">
        {[0, 1].map((i) => (
          <div
            key={i}
            className="rounded-xl animate-pulse bg-gray-200 flex-1"
            style={{ minHeight: "196px" }}
          />
        ))}
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="rounded-2xl animate-pulse bg-gray-200"
          style={{ height: "260px" }}
        />
      ))}
    </div>
  </div>
);

// ─── Empty State ──────────────────────────────────────────────────────────────
const EmptyState: React.FC<{ onWrite: () => void }> = ({ onWrite }) => (
  <div className="text-center py-24">
    <div
      className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
      style={{ background: "#fff3ee", border: "1px solid #fddccb" }}
    >
      <HugeiconsIcon
        icon={MessageIcon}
        size={28}
        color="#F25912"
        strokeWidth={1.5}
      />
    </div>
    <h3 className="text-xl font-bold mb-2" style={{ color: "#222831" }}>
      No articles yet
    </h3>
    <p className="text-sm mb-6" style={{ color: "#9ca3af" }}>
      Be the first to share something with the community!
    </p>
    <Button
      onClick={onWrite}
      className="rounded-full bg-[#F25912] hover:bg-[#D94E0F] border-0 gap-2"
    >
      <HugeiconsIcon
        icon={PencilEdit01Icon}
        size={16}
        color="white"
        strokeWidth={2.5}
      />
      Write First Article
    </Button>
  </div>
);

export default Community;
