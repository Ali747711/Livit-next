export interface MessageMember {
  _id: string;
  memberNick: string;
  memberImage?: string;
  memberType?: string;
}

export interface Message {
  _id: string;
  senderId: string;
  receiverId: string;
  messageText: string;
  messageStatus: "UNREAD" | "READ";
  createdAt: string;
  updatedAt: string;
  senderData?: MessageMember;
  receiverData?: MessageMember;
}

export interface Messages {
  list: Message[];
  metaCounter: [{ total: number }];
}

export interface Notification {
  _id: string;
  authorId: string;
  receiverId: string;
  notificationType: string;
  notificationStatus: "UNREAD" | "READ";
  notificationDesc: string;
  notificationRefId?: string;
  createdAt: string;
  updatedAt: string;
  authorData?: MessageMember;
}

export interface Notifications {
  list: Notification[];
  metaCounter: [{ total: number }];
}

export interface RecentConversation {
  _id: string;
  memberNick: string;
  memberImage?: string;
  lastMessage?: string;
  lastMessageAt?: string;
}
