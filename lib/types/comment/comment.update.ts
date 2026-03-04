import { CommentStatus } from "@/lib/enums/comment";

export interface CommentUpdate {
  _id: string;
  commentStatus?: CommentStatus;
  commentContent?: string;
}
