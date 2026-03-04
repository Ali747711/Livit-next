import { MeLiked, TotalCounter } from "../property/property";
import { Member } from "../member/member";
import { CommentGroup, CommentStatus } from "@/lib/enums/comment";

export interface Comment {
  _id: string;
  commentStatus: CommentStatus;
  commentGroup: CommentGroup;
  commentContent: string;
  commentRefId: string;
  memberId: string;
  createdAt: Date;
  updatedAt: Date;
  /** from aggregation **/
  meLiked?: MeLiked[];
  memberData?: Member;
}

export interface Comments {
  list: Comment[];
  metaCounter: TotalCounter[];
}
