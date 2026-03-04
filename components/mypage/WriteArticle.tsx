import React, { useState } from "react";
import { useRouter } from "next/router";
import { useMutation, useReactiveVar } from "@apollo/client/react";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  PencilEdit01Icon,
  ImageUploadIcon,
  Cancel01Icon,
  Tick01Icon,
} from "@hugeicons/core-free-icons";
import { CREATE_BOARD_ARTICLE } from "@/apollo/user/mutation";
import { userVar } from "@/apollo/store";
import { BoardArticleInput } from "@/lib/types/board-article/board-article.input";
import { BoardArticleCategory } from "@/lib/enums/board-article";

const CATEGORIES = [
  {
    value: BoardArticleCategory.FREE,
    label: "Free",
    desc: "General discussion",
  },
  {
    value: BoardArticleCategory.RECOMMEND,
    label: "Recommend",
    desc: "Property recommendations",
  },
  { value: BoardArticleCategory.NEWS, label: "News", desc: "Real estate news" },
  { value: BoardArticleCategory.HUMOR, label: "Humor", desc: "Fun posts" },
];

const fieldStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: "10px",
  border: "1px solid #ebebeb",
  fontSize: "14px",
  color: "#374151",
  background: "#fff",
  outline: "none",
  transition: "border-color 0.2s",
};

const WriteArticle: React.FC = () => {
  const router = useRouter();
  const user = useReactiveVar(userVar);

  const [form, setForm] = useState<BoardArticleInput>({
    articleCategory: BoardArticleCategory.FREE,
    articleTitle: "",
    articleContent: "",
    articleImage: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [createBoardArticle] = useMutation(CREATE_BOARD_ARTICLE);

  const titleLen = form.articleTitle.length;
  const contentLen = form.articleContent.length;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user._id) {
      toast.error("Please login first");
      return;
    }
    if (titleLen < 3 || titleLen > 50) {
      toast.error("Title must be 3–50 characters");
      return;
    }
    if (contentLen < 3 || contentLen > 250) {
      toast.error("Content must be 3–250 characters");
      return;
    }

    setSubmitting(true);
    try {
      const input: BoardArticleInput = {
        articleCategory: form.articleCategory,
        articleTitle: form.articleTitle.trim(),
        articleContent: form.articleContent.trim(),
        ...(form.articleImage?.trim()
          ? { articleImage: form.articleImage.trim() }
          : {}),
      };
      const { data }: any = await createBoardArticle({ variables: { input } });
      const created = data?.createBoardArticle;
      toast.success("Article published!");
      if (created?._id) router.push(`/community/${created._id}`);
      else router.push("/community");
    } catch (err: any) {
      toast.error(err.message || "Failed to publish");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () =>
    setForm({
      articleCategory: BoardArticleCategory.FREE,
      articleTitle: "",
      articleContent: "",
      articleImage: "",
    });

  return (
    <div className="space-y-5">
      {/* Header card */}
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
        <div className="p-6 flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "#fff3ee" }}
          >
            <HugeiconsIcon
              icon={PencilEdit01Icon}
              size={20}
              color="#F25912"
              strokeWidth={1.5}
            />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
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
              Write Article
            </h1>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div
          className="rounded-2xl p-7 space-y-7"
          style={{ background: "#fff", border: "1px solid #ebebeb" }}
        >
          {/* Category pills */}
          <div>
            <label
              className="block text-sm font-extrabold mb-3"
              style={{ color: "#222831" }}
            >
              Category <span style={{ color: "#F25912" }}>*</span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {CATEGORIES.map((cat) => {
                const isActive = form.articleCategory === cat.value;
                return (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() =>
                      setForm((p) => ({ ...p, articleCategory: cat.value }))
                    }
                    className="p-3 rounded-xl border text-left transition-all"
                    style={{
                      borderColor: isActive ? "#F25912" : "#ebebeb",
                      background: isActive ? "#fff3ee" : "#fff",
                    }}
                  >
                    <p
                      className="font-bold text-sm"
                      style={{ color: isActive ? "#F25912" : "#222831" }}
                    >
                      {cat.label}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "#9ca3af" }}>
                      {cat.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div style={{ borderTop: "1px solid #f3f4f6", paddingTop: "24px" }}>
            <div className="flex items-center justify-between mb-1.5">
              <label
                className="text-sm font-extrabold"
                style={{ color: "#222831" }}
              >
                Title <span style={{ color: "#F25912" }}>*</span>
              </label>
              <span
                className="text-xs"
                style={{ color: titleLen > 50 ? "#ef4444" : "#9ca3af" }}
              >
                {titleLen}/50
              </span>
            </div>
            <input
              name="articleTitle"
              type="text"
              value={form.articleTitle}
              onChange={handleChange}
              placeholder="Enter a clear, descriptive title…"
              maxLength={50}
              style={fieldStyle}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#F25912")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#ebebeb")}
            />
          </div>

          {/* Content */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                className="text-sm font-extrabold"
                style={{ color: "#222831" }}
              >
                Content <span style={{ color: "#F25912" }}>*</span>
              </label>
              <span
                className="text-xs"
                style={{ color: contentLen > 250 ? "#ef4444" : "#9ca3af" }}
              >
                {contentLen}/250
              </span>
            </div>
            <textarea
              name="articleContent"
              value={form.articleContent}
              onChange={handleChange}
              placeholder="Write your article content here…"
              rows={7}
              maxLength={250}
              style={{ ...fieldStyle, resize: "none" }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#F25912")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#ebebeb")}
            />
            <p className="text-xs mt-1" style={{ color: "#9ca3af" }}>
              3–250 characters
            </p>
          </div>

          {/* Cover image URL */}
          <div>
            <label
              className="block text-sm font-extrabold mb-1.5"
              style={{ color: "#222831" }}
            >
              Cover Image URL{" "}
              <span className="font-medium" style={{ color: "#9ca3af" }}>
                (optional)
              </span>
            </label>
            <div className="relative">
              <HugeiconsIcon
                icon={ImageUploadIcon}
                size={16}
                color="#9ca3af"
                strokeWidth={1.5}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              />
              <input
                name="articleImage"
                type="text"
                value={form.articleImage ?? ""}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
                style={{ ...fieldStyle, paddingLeft: "40px" }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#F25912")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#ebebeb")}
              />
            </div>
            {form.articleImage?.trim() && (
              <div
                className="mt-3 h-28 rounded-xl overflow-hidden"
                style={{ border: "1px solid #ebebeb" }}
              >
                <img
                  src={form.articleImage}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) =>
                    ((e.target as HTMLImageElement).style.display = "none")
                  }
                />
              </div>
            )}
          </div>

          {/* Footer actions */}
          <div
            className="flex items-center justify-between pt-4"
            style={{ borderTop: "1px solid #f3f4f6" }}
          >
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{ color: "#6b7280" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  "#f3f4f6";
                (e.currentTarget as HTMLButtonElement).style.color = "#374151";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  "transparent";
                (e.currentTarget as HTMLButtonElement).style.color = "#6b7280";
              }}
            >
              <HugeiconsIcon
                icon={Cancel01Icon}
                size={15}
                color="currentColor"
                strokeWidth={2}
              />
              Clear
            </button>

            <button
              type="submit"
              disabled={
                submitting ||
                titleLen < 3 ||
                titleLen > 50 ||
                contentLen < 3 ||
                contentLen > 250
              }
              className="flex items-center gap-2 px-7 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-40 transition-all"
              style={{
                background: "#F25912",
                boxShadow: "0 4px 14px rgba(242,89,18,0.28)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              {submitting ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <HugeiconsIcon
                  icon={Tick01Icon}
                  size={15}
                  color="white"
                  strokeWidth={2.5}
                />
              )}
              {submitting ? "Publishing…" : "Publish Article"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default WriteArticle;
