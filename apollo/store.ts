import { CustomJwtPayload } from "@/lib/types/customJwtPayload";
import { makeVar } from "@apollo/client";

export const themeVar = makeVar({});

export const userVar = makeVar<CustomJwtPayload>({
  _id: "",
  memberType: "",
  memberStatus: "",
  memberAuthType: "",
  memberPhone: "",
  memberNick: "",
  memberFullName: "",
  memberImage: "",
  memberAddress: "",
  memberDesc: "",
  memberProperties: 0,
  memberRank: 0,
  memberArticles: 0,
  memberPoints: 0,
  memberLikes: 0,
  memberViews: 0,
  memberWarnings: 0,
  memberBlocks: 0,
  createdAt: null,
  updatedAt: null,
});

export const socketVar = makeVar<WebSocket | null>(null);

export const notifCountVar = makeVar<number>(0);
