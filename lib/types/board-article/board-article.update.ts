import { BoardArticleStatus } from "@/lib/enums/board-article";

export interface BoardArticleUpdate {
  _id: string;
  articleStatus?: BoardArticleStatus;
  articleTitle?: string;
  articleContent?: string;
  articleImage?: string;
}
