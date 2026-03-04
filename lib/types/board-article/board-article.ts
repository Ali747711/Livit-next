import { MeLiked, TotalCounter } from "@/lib/types/common";
import { Member } from "@/lib/types/member/member";
import { BoardArticleCategory, BoardArticleStatus } from "@/lib/enums/board-article";

export interface BoardArticle {
  _id: string;
  articleCategory: BoardArticleCategory;
  articleStatus: BoardArticleStatus;
  articleTitle: string;
  articleContent: string;
  articleImage?: string;
  articleViews: number;
  articleLikes: number;
  articleComments: number;
  memberId: string;
  createdAt: Date;
  updatedAt: Date;
  memberData?: Member;
  meLiked?: MeLiked[];
}

export interface BoardArticles {
  list: BoardArticle[];
  metaCounter: TotalCounter[];
}
