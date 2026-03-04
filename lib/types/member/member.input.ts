import { Direction } from "@/lib/enums/common";
import { MemberAuthType, MemberStatus, MemberType } from "@/lib/enums/member";

export interface MemberInput {
  memberNick: string;
  memberPassword: string;
  memberPhone: string;
  memberType?: MemberType;
  memberAuthType?: MemberAuthType;
}

export interface LoginInput {
  memberNick: string;
  memberPassword: string;
}

interface AISearch {
  text?: string;
}

export interface AgentsInquiry {
  page: number;
  limit: number;
  sort?: string;
  direction?: Direction;
  search: AISearch;
}

interface MISearch {
  memberStatus?: MemberStatus;
  memberType?: MemberType;
  text?: string;
}

export interface MembersInquiry {
  page: number;
  limit: number;
  sort?: string;
  direction?: Direction;
  search: MISearch;
}
