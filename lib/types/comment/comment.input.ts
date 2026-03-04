import { CommentGroup } from "@/lib/enums/comment";
import { Direction } from "@/lib/enums/common";

export interface CommentInput {
  commentGroup: CommentGroup;
  commentContent: string;
  commentRefId: string;
  memberId?: string;
}

interface CISearch {
  commentRefId: string;
}

export interface CommentsInquiry {
  page: number;
  limit: number;
  sort?: string;
  direction?: Direction;
  search: CISearch;
}
