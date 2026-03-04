import { getImageUrl } from "@/lib/utils";
import {
  Calendar01Icon,
  Cancel01Icon,
  EyeIcon,
  FavouriteIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

const statusColors: Record<string, string> = {
  ACTIVE: "bg-emerald-100 text-emerald-700",
  DELETE: "bg-red-100 text-red-700",
};

const categoryColors: Record<string, string> = {
  FREE: "bg-blue-100 text-blue-700",
  RECOMMEND: "bg-violet-100 text-violet-700",
  NEWS: "bg-amber-100 text-amber-700",
  HUMOR: "bg-pink-100 text-pink-700",
};

const ArticleDetailModal: React.FC<{
  article: any;
  onClose: () => void;
}> = ({ article, onClose }) => {
  const authorImage = article.memberData?.memberImage
    ? getImageUrl(article.memberData.memberImage)
    : "/img/profiles/avatardef.png";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Panel */}
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors"
        >
          <HugeiconsIcon
            icon={Cancel01Icon}
            size={18}
            color="#475569"
            strokeWidth={2}
          />
        </button>

        {/* Cover image */}
        {article.articleImage && (
          <div className="h-52 overflow-hidden rounded-t-2xl">
            <img
              src={getImageUrl(article.articleImage)}
              alt={article.articleTitle}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="p-6">
          {/* Badges */}
          <div className="flex items-center gap-2 mb-3">
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                categoryColors[article.articleCategory] ??
                "bg-slate-100 text-slate-600"
              }`}
            >
              {article.articleCategory}
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                statusColors[article.articleStatus] ??
                "bg-slate-100 text-slate-600"
              }`}
            >
              {article.articleStatus}
            </span>
          </div>

          {/* Title */}
          <h2 className="text-xl font-bold text-slate-900 mb-4 leading-tight">
            {article.articleTitle}
          </h2>

          {/* Author + date */}
          <div className="flex items-center gap-3 mb-5 pb-5 border-b border-slate-100">
            <img
              src={authorImage}
              alt={article.memberData?.memberNick ?? "User"}
              className="w-9 h-9 rounded-full object-cover border-2 border-white shadow"
            />
            <div>
              <p className="text-sm font-semibold text-slate-800">
                {article.memberData?.memberNick ?? "Unknown"}
              </p>
              <div className="flex items-center gap-1 text-xs text-slate-400">
                <HugeiconsIcon
                  icon={Calendar01Icon}
                  size={12}
                  color="currentColor"
                  strokeWidth={1.5}
                />
                {new Date(article.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            </div>

            {/* Stats */}
            <div className="ml-auto flex items-center gap-4 text-slate-400 text-sm">
              <span className="flex items-center gap-1.5">
                <HugeiconsIcon
                  icon={EyeIcon}
                  size={15}
                  color="currentColor"
                  strokeWidth={1.5}
                />
                {article.articleViews}
              </span>
              <span className="flex items-center gap-1.5">
                <HugeiconsIcon
                  icon={FavouriteIcon}
                  size={15}
                  color="currentColor"
                  strokeWidth={1.5}
                />
                {article.articleLikes}
              </span>
            </div>
          </div>

          {/* Content */}
          <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
            {article.articleContent}
          </p>

          {/* Article ID */}
          <p className="mt-5 text-xs text-slate-400 font-mono">
            ID: {article._id}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ArticleDetailModal;
