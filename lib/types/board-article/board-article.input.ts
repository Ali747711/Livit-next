import { Direction } from "@/lib/enums/common";
import { BoardArticleCategory, BoardArticleStatus } from "@/lib/enums/board-article";

export interface BoardArticleInput {
  articleCategory: BoardArticleCategory;
  articleTitle: string;
  articleContent: string;
  articleImage?: string;
}

interface BAISearch {
  articleCategory?: BoardArticleCategory;
  text?: string;
  memberId?: string;
}

export interface BoardArticlesInquiry {
  page: number;
  limit: number;
  sort?: string;
  direction?: Direction;
  search: BAISearch;
}

interface ALBAISearch {
  articleStatus?: BoardArticleStatus;
  articleCategory?: BoardArticleCategory;
}

export interface AllBoardArticlesInquiry {
  page: number;
  limit: number;
  sort?: string;
  direction?: Direction;
  search: ALBAISearch;
}
