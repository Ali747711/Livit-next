import { NextPage } from "next";
import { useRouter } from "next/router";
import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useReactiveVar } from "@apollo/client/react";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  EyeIcon,
  FavouriteIcon,
  MessageIcon,
  UserIcon,
  Calendar01Icon,
  SendToMobileFreeIcons,
} from "@hugeicons/core-free-icons";
import { GET_BOARD_ARTICLE, GET_COMMENTS } from "@/apollo/user/query";
import {
  LIKE_TARGET_BOARD_ARTICLE,
  CREATE_COMMENT,
} from "@/apollo/user/mutation";
import { userVar } from "@/apollo/store";
import { BoardArticle } from "@/lib/types/board-article/board-article";
import { Comment, Comments } from "@/lib/types/comment/comment";
import { CommentsInquiry } from "@/lib/types/comment/comment.input";
import { CommentGroup } from "@/lib/enums/comment";
import { Direction } from "@/lib/enums/common";
import { getImageUrl } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

interface GetBoardArticleResponse {
  getBoardArticle: BoardArticle;
}
interface GetCommentsResponse {
  getComments: Comments;
}

const categoryMeta: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  FREE: { label: "Free", color: "#2563eb", bg: "#eff6ff" },
  RECOMMEND: { label: "Recommend", color: "#7c3aed", bg: "#f5f3ff" },
  NEWS: { label: "News", color: "#d97706", bg: "#fffbeb" },
  HUMOR: { label: "Humor", color: "#db2777", bg: "#fdf2f8" },
};

const ArticleDetail: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const user = useReactiveVar(userVar);

  const [article, setArticle] = useState<BoardArticle | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentTotal, setCommentTotal] = useState(0);
  const [commentText, setCommentText] = useState("");
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  const commentInquiry: CommentsInquiry = {
    page: 1,
    limit: 20,
    direction: Direction.DESC,
    search: { commentRefId: id as string },
  };

  const { data: articleData, loading: articleLoading } =
    useQuery<GetBoardArticleResponse>(GET_BOARD_ARTICLE, {
      fetchPolicy: "network-only",
      skip: !id,
      variables: { input: id },
    });

  const {
    data: commentsData,
    loading: commentsLoading,
    refetch: refetchComments,
  } = useQuery<GetCommentsResponse>(GET_COMMENTS, {
    fetchPolicy: "network-only",
    skip: !id,
    variables: { input: commentInquiry },
  });

  const [likeTargetBoardArticle] = useMutation(LIKE_TARGET_BOARD_ARTICLE);
  const [createComment] = useMutation(CREATE_COMMENT);

  useEffect(() => {
    if (articleData?.getBoardArticle) {
      const a = articleData.getBoardArticle;
      setArticle(a);
      setLikesCount(a.articleLikes);
      setLiked(a.meLiked?.[0]?.myFavorite ?? false);
    }
  }, [articleData]);

  useEffect(() => {
    if (commentsData?.getComments) {
      setComments(commentsData.getComments.list);
      setCommentTotal(commentsData.getComments.metaCounter[0]?.total ?? 0);
    }
  }, [commentsData]);

  const handleLike = async () => {
    if (!user._id) {
      toast.error("Please login to like articles");
      return;
    }
    try {
      const { data }: any = await likeTargetBoardArticle({
        variables: { input: id },
      });
      const updated = data?.likeTargetBoardArticle;
      if (updated) {
        setLikesCount(updated.articleLikes);
        setLiked(!liked);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to like article");
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user._id) {
      toast.error("Please login to comment");
      return;
    }
    if (!commentText.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }
    if (commentText.trim().length < 3) {
      toast.error("Comment must be at least 3 characters");
      return;
    }
    try {
      await createComment({
        variables: {
          input: {
            commentGroup: CommentGroup.ARTICLE,
            commentContent: commentText.trim(),
            commentRefId: id,
          },
        },
      });
      toast.success("Comment posted!");
      setCommentText("");
      await refetchComments({ input: commentInquiry });
    } catch (err: any) {
      toast.error(err.message || "Failed to post comment");
    }
  };

  // ── Loading ──────────────────────────────────────────────────────────
  if (articleLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#f7f7f5" }}
      >
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-10 h-10 rounded-full border-[3px] border-t-transparent animate-spin"
            style={{ borderColor: "#F25912", borderTopColor: "transparent" }}
          />
          <p className="text-sm font-medium" style={{ color: "#9ca3af" }}>
            Loading article...
          </p>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#f7f7f5" }}
      >
        <div className="text-center">
          <h2 className="text-xl font-bold mb-3" style={{ color: "#222831" }}>
            Article not found
          </h2>
          <Button
            onClick={() => router.push("/community")}
            className="rounded-full bg-[#F25912] hover:bg-[#D94E0F] border-0"
          >
            Back to Community
          </Button>
        </div>
      </div>
    );
  }

  const authorImage = article.memberData?.memberImage
    ? getImageUrl(article.memberData.memberImage)
    : "/img/profiles/avatardef.png";

  const meta = categoryMeta[article.articleCategory];

  return (
    <div className="min-h-screen" style={{ background: "#f7f7f5" }}>
      {/* ── Hero: Cover image or dark gradient ─────────────────────── */}
      <div
        className="relative -mt-16 overflow-hidden"
        style={{ height: "420px" }}
      >
        {article.articleImage ? (
          <img
            src={getImageUrl(article.articleImage)}
            alt={article.articleTitle}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(135deg, #222831 0%, #2d3a45 100%)",
              backgroundImage:
                "radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />
        )}
        {/* Strong bottom fade so text is readable */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />

        {/* Left accent bar */}
        <div
          className="absolute left-0 top-0 bottom-0 w-1"
          style={{
            background: "linear-gradient(to bottom, #F25912, transparent)",
          }}
        />

        {/* Content over hero */}
        <div className="absolute inset-0 flex flex-col justify-end">
          <div className="container mx-auto px-6 max-w-4xl pb-10">
            {/* Back */}
            <button
              onClick={() => router.push("/community")}
              className="flex items-center gap-1.5 text-sm font-semibold mb-5 group transition-colors"
              style={{ color: "rgba(255,255,255,0.5)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#F25912")}
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "rgba(255,255,255,0.5)")
              }
            >
              <HugeiconsIcon
                icon={ArrowLeft01Icon}
                size={16}
                color="currentColor"
                strokeWidth={2}
                className="group-hover:-translate-x-0.5 transition-transform"
              />
              Community
            </button>

            {/* Badge */}
            {meta && (
              <span
                className="inline-block px-3 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mb-4"
                style={{ background: "#F25912", color: "#fff" }}
              >
                {meta.label}
              </span>
            )}

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-extrabold text-white leading-tight mb-4 max-w-2xl">
              {article.articleTitle}
            </h1>

            {/* Author + meta */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <img
                  src={authorImage}
                  alt={article.memberData?.memberNick ?? "User"}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-white/20"
                />
                <span className="text-sm font-semibold text-white/70">
                  {article.memberData?.memberNick ?? "Unknown"}
                </span>
              </div>
              <div className="w-px h-4 bg-white/20" />
              <span className="flex items-center gap-1 text-sm text-white/50">
                <HugeiconsIcon
                  icon={Calendar01Icon}
                  size={13}
                  color="currentColor"
                  strokeWidth={1.5}
                />
                {new Date(article.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
              <div className="w-px h-4 bg-white/20" />
              <div className="flex items-center gap-3 text-sm text-white/50">
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
                    icon={MessageIcon}
                    size={13}
                    color="currentColor"
                    strokeWidth={1.5}
                  />
                  {commentTotal}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────────────────── */}
      <div className="container mx-auto px-6 max-w-4xl py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Article content — 2/3 */}
          <div className="lg:col-span-2">
            {/* Content card */}
            <Card className="rounded-2xl border-[#ebebeb] mb-6">
              <CardContent className="p-7 md:p-9">
                <p
                  className="text-base leading-[1.85] whitespace-pre-wrap"
                  style={{ color: "#374151" }}
                >
                  {article.articleContent}
                </p>
              </CardContent>
            </Card>

            {/* Like button */}
            <div className="flex items-center gap-3 mb-10">
              <Button
                onClick={handleLike}
                variant="outline"
                className={cn(
                  "rounded-full gap-2 font-bold text-sm transition-all",
                  liked
                    ? "bg-[#fff3ee] text-[#F25912] border-[#F25912] hover:bg-[#fff3ee] hover:text-[#F25912]"
                    : "bg-white text-[#6b7280] border-[#e5e7eb] hover:text-[#222831] hover:border-[#222831]",
                )}
              >
                <HugeiconsIcon
                  icon={FavouriteIcon}
                  size={16}
                  color="currentColor"
                  strokeWidth={liked ? 0 : 1.5}
                  className={liked ? "fill-[#F25912]" : ""}
                />
                {likesCount} {liked ? "Liked" : "Like"}
              </Button>
            </div>

            {/* ── Comments ─────────────────────────────────────────── */}
            <Card className="rounded-2xl border-[#ebebeb]">
              <CardHeader className="px-6 md:px-8 pt-6 md:pt-8 pb-0">
                <CardTitle
                  className="text-lg flex items-center gap-2"
                  style={{ color: "#222831" }}
                >
                  <HugeiconsIcon
                    icon={MessageIcon}
                    size={20}
                    color="#F25912"
                    strokeWidth={2}
                  />
                  Comments
                  <span
                    className="text-sm font-normal ml-0.5"
                    style={{ color: "#9ca3af" }}
                  >
                    ({commentTotal})
                  </span>
                </CardTitle>
              </CardHeader>

              <CardContent className="p-6 md:p-8 pt-6">
                {/* Comment form */}
                <form onSubmit={handleCommentSubmit} className="mb-8">
                  <div className="flex gap-3">
                    <div
                      className="w-9 h-9 rounded-full overflow-hidden shrink-0 ring-1 ring-[#e5e7eb]"
                    >
                      {user._id ? (
                        <img
                          src={
                            user.memberImage
                              ? getImageUrl(user.memberImage)
                              : "/img/profiles/avatardef.png"
                          }
                          alt="me"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center"
                          style={{ background: "#f3f4f6" }}
                        >
                          <HugeiconsIcon
                            icon={UserIcon}
                            size={16}
                            color="#9ca3af"
                            strokeWidth={1.5}
                          />
                        </div>
                      )}
                    </div>

                    <div
                      className="flex-1 flex rounded-xl overflow-hidden border transition-all focus-within:border-[#F25912]"
                      style={{ borderColor: "#e5e7eb" }}
                    >
                      <Input
                        type="text"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder={
                          user._id
                            ? "Write a comment..."
                            : "Login to leave a comment"
                        }
                        disabled={!user._id}
                        maxLength={250}
                        className="flex-1 h-full rounded-none border-0 focus-visible:ring-0 text-sm px-4 bg-transparent shadow-none disabled:cursor-not-allowed disabled:bg-gray-50"
                      />
                      <Button
                        type="submit"
                        disabled={!user._id || !commentText.trim()}
                        size="icon"
                        className="rounded-none rounded-r-xl bg-[#F25912] hover:bg-[#D94E0F] border-0 w-12 shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <HugeiconsIcon
                          icon={SendToMobileFreeIcons}
                          size={17}
                          color="white"
                          strokeWidth={2}
                        />
                      </Button>
                    </div>
                  </div>
                </form>

                {/* Comment list */}
                {commentsLoading ? (
                  <div className="space-y-4">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="flex gap-3 animate-pulse">
                        <div className="w-9 h-9 rounded-full bg-gray-100 shrink-0" />
                        <div className="flex-1 space-y-2 pt-1">
                          <div className="h-3 bg-gray-100 rounded w-24" />
                          <div className="h-3 bg-gray-100 rounded w-3/4" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : comments.length === 0 ? (
                  <div className="text-center py-10">
                    <HugeiconsIcon
                      icon={MessageIcon}
                      size={28}
                      color="#e5e7eb"
                      strokeWidth={1}
                      className="mx-auto mb-3"
                    />
                    <p className="text-sm" style={{ color: "#9ca3af" }}>
                      No comments yet. Be the first!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {comments.map((comment) => (
                      <CommentItem key={comment._id} comment={comment} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar — 1/3 */}
          <div className="space-y-5">
            {/* Author card */}
            <Card className="rounded-2xl border-[#ebebeb]">
              <CardContent className="p-5">
                <p
                  className="text-xs font-bold uppercase tracking-wider mb-4"
                  style={{ color: "#9ca3af" }}
                >
                  Written by
                </p>
                <div className="flex items-center gap-3">
                  <img
                    src={authorImage}
                    alt={article.memberData?.memberNick ?? "User"}
                    className="w-12 h-12 rounded-full object-cover"
                    style={{ border: "2px solid #ebebeb" }}
                  />
                  <div>
                    <p className="font-bold text-sm" style={{ color: "#222831" }}>
                      {article.memberData?.memberNick ?? "Unknown"}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "#9ca3af" }}>
                      Community Member
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Article stats */}
            <Card className="rounded-2xl border-[#ebebeb]">
              <CardContent className="p-5">
                <p
                  className="text-xs font-bold uppercase tracking-wider mb-4"
                  style={{ color: "#9ca3af" }}
                >
                  Stats
                </p>
                <div className="space-y-3">
                  {[
                    {
                      icon: EyeIcon,
                      label: "Views",
                      value: article.articleViews,
                    },
                    { icon: FavouriteIcon, label: "Likes", value: likesCount },
                    { icon: MessageIcon, label: "Comments", value: commentTotal },
                  ].map(({ icon, label, value }, i, arr) => (
                    <React.Fragment key={label}>
                      <div className="flex items-center justify-between">
                        <span
                          className="flex items-center gap-2 text-sm"
                          style={{ color: "#6b7280" }}
                        >
                          <HugeiconsIcon
                            icon={icon}
                            size={15}
                            color="#9ca3af"
                            strokeWidth={1.5}
                          />
                          {label}
                        </span>
                        <span
                          className="text-sm font-bold"
                          style={{ color: "#222831" }}
                        >
                          {value}
                        </span>
                      </div>
                      {i < arr.length - 1 && (
                        <Separator className="bg-[#f3f4f6]" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Category tag */}
            {meta && (
              <Card className="rounded-2xl border-[#ebebeb]">
                <CardContent className="p-5">
                  <p
                    className="text-xs font-bold uppercase tracking-wider mb-3"
                    style={{ color: "#9ca3af" }}
                  >
                    Category
                  </p>
                  <span
                    className="inline-block px-3 py-1 rounded-lg text-sm font-bold"
                    style={{ background: meta.bg, color: meta.color }}
                  >
                    {meta.label}
                  </span>
                </CardContent>
              </Card>
            )}

            {/* Back link */}
            <Button
              variant="outline"
              onClick={() => router.push("/community")}
              className="w-full rounded-xl border-[#e5e7eb] text-[#6b7280] hover:border-[#F25912] hover:text-[#F25912] gap-2"
            >
              <HugeiconsIcon
                icon={ArrowLeft01Icon}
                size={15}
                color="currentColor"
                strokeWidth={2}
              />
              Back to Community
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Comment Item ─────────────────────────────────────────────────────────────
const CommentItem: React.FC<{ comment: Comment }> = ({ comment }) => {
  const authorImage = comment.memberData?.memberImage
    ? getImageUrl(comment.memberData.memberImage)
    : "/img/profiles/avatardef.png";

  return (
    <div className="flex gap-3">
      <img
        src={authorImage}
        alt={comment.memberData?.memberNick ?? "User"}
        className="w-9 h-9 rounded-full object-cover shrink-0"
        style={{ border: "1px solid #e5e7eb" }}
      />
      <div
        className="flex-1 rounded-xl px-4 py-3"
        style={{ background: "#f9f9f7", border: "1px solid #ebebeb" }}
      >
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-sm font-bold" style={{ color: "#222831" }}>
            {comment.memberData?.memberNick ?? "Unknown"}
          </span>
          <span className="text-xs" style={{ color: "#9ca3af" }}>
            {new Date(comment.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>
        <p className="text-sm leading-relaxed" style={{ color: "#4b5563" }}>
          {comment.commentContent}
        </p>
      </div>
    </div>
  );
};

export default ArticleDetail;
