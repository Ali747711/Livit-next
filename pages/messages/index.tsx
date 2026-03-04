import React, { useState, useEffect, useRef } from "react";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useReactiveVar, useQuery, useMutation } from "@apollo/client/react";
import { userVar, socketVar, notifCountVar } from "@/apollo/store";
import {
  GET_MESSAGES,
  GET_MY_NOTIFICATIONS,
  GET_MEMBER,
} from "@/apollo/user/query";
import {
  UPDATE_MESSAGE_STATUS,
  UPDATE_NOTIFICATION,
} from "@/apollo/user/mutation";
import { Message, RecentConversation } from "@/lib/types/message/message";
import { getImageUrl } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Navigation03Icon,
  Message01Icon,
  ArrowLeft01Icon,
  Tick01Icon,
  TickDouble01Icon,
  Search01Icon,
  UserEdit01Icon,
} from "@hugeicons/core-free-icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const RECENT_KEY = "recentConversations";

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

const formatDate = (iso: string) => {
  const d = new Date(iso);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return "Today";
  const y = new Date(today);
  y.setDate(y.getDate() - 1);
  if (d.toDateString() === y.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatRelative = (iso?: string) => {
  if (!iso) return "";
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (diff < 1) return "now";
  if (diff < 60) return `${diff}m`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h`;
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

type AvatarSize = "xs" | "sm" | "md" | "lg";
const sizeMap: Record<AvatarSize, string> = {
  xs: "h-6 w-6",
  sm: "h-7 w-7",
  md: "h-10 w-10",
  lg: "h-12 w-12",
};
const textSizeMap: Record<AvatarSize, string> = {
  xs: "text-[9px]",
  sm: "text-[10px]",
  md: "text-sm",
  lg: "text-base",
};

const MemberAvatar = ({
  image,
  nick,
  size = "md",
}: {
  image?: string;
  nick: string;
  size?: AvatarSize;
}) => (
  <Avatar className={`${sizeMap[size]} shrink-0 border-2 border-[#fff3ee]`}>
    {image && (
      <AvatarImage
        src={getImageUrl(image)}
        alt={nick}
        className="object-cover"
      />
    )}
    <AvatarFallback
      className={`bg-[#f0f0ee] text-[#F25912] font-semibold ${textSizeMap[size]}`}
    >
      {nick.slice(0, 2).toUpperCase()}
    </AvatarFallback>
  </Avatar>
);

const MessagesPage: NextPage = () => {
  const router = useRouter();
  const activeMemberId = router.query.memberId as string | undefined;
  const user = useReactiveVar(userVar);
  const socket = useReactiveVar(socketVar);

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [recentConvs, setRecentConvs] = useState<RecentConversation[]>([]);
  const [search, setSearch] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [updateMessageStatus] = useMutation(UPDATE_MESSAGE_STATUS);
  const [updateNotification] = useMutation(UPDATE_NOTIFICATION);

  const { data: messagesData, loading: messagesLoading } = useQuery<any>(
    GET_MESSAGES,
    {
      variables: {
        input: { page: 1, limit: 50, search: { memberId: activeMemberId } },
      },
      skip: !activeMemberId || !user._id,
      fetchPolicy: "network-only",
    },
  );

  const { data: memberData } = useQuery<any>(GET_MEMBER, {
    variables: { input: activeMemberId },
    skip: !activeMemberId,
  });

  const { data: notifData } = useQuery<any>(GET_MY_NOTIFICATIONS, {
    variables: { input: { page: 1, limit: 50 } },
    skip: !user._id,
    fetchPolicy: "network-only",
  });

  useEffect(() => {
    if (messagesData?.getMessages?.list) {
      const sorted = [...messagesData.getMessages.list].sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
      setMessages(sorted);
    }
  }, [messagesData]);

  useEffect(() => {
    if (!messagesData?.getMessages?.list || !user._id) return;
    messagesData.getMessages.list
      .filter(
        (m: Message) =>
          m.messageStatus === "UNREAD" && m.receiverId === user._id,
      )
      .forEach((m: Message) =>
        updateMessageStatus({ variables: { messageId: m._id } }).catch(
          () => {},
        ),
      );
  }, [messagesData, user._id]);

  useEffect(() => {
    if (!notifData?.getMyNotifications?.list || !activeMemberId) return;
    const unread = notifData.getMyNotifications.list.filter(
      (n: any) =>
        n.notificationStatus === "UNREAD" && n.authorId === activeMemberId,
    );
    unread.forEach((n: any) =>
      updateNotification({ variables: { notificationId: n._id } }).catch(
        () => {},
      ),
    );
    if (unread.length > 0)
      notifCountVar(Math.max(0, notifCountVar() - unread.length));
  }, [notifData, activeMemberId]);

  useEffect(() => {
    if (!memberData?.getMember || !activeMemberId) return;
    const m = memberData.getMember;
    const stored: RecentConversation[] = JSON.parse(
      localStorage.getItem(RECENT_KEY) || "[]",
    );
    const lastMsg = messages[messages.length - 1];
    const entry: RecentConversation = {
      _id: m._id,
      memberNick: m.memberNick,
      memberImage: m.memberImage,
      lastMessage: lastMsg?.messageText,
      lastMessageAt: lastMsg?.createdAt,
    };
    const updated = [entry, ...stored.filter((r) => r._id !== m._id)].slice(
      0,
      10,
    );
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
    setRecentConvs(updated);
  }, [memberData, messages.length]);

  useEffect(() => {
    const stored: RecentConversation[] = JSON.parse(
      localStorage.getItem(RECENT_KEY) || "[]",
    );
    setRecentConvs(stored);
  }, []);

  useEffect(() => {
    if (!socket) return;
    const handler = (event: MessageEvent) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.event !== "createMessage") return;
        const d: Message = msg.data;
        if (d.senderId !== user._id && d.receiverId !== user._id) return;
        const otherId = d.senderId === user._id ? d.receiverId : d.senderId;
        if (otherId === activeMemberId) {
          setMessages((prev) => [...prev, d]);
          if (d.receiverId === user._id)
            updateMessageStatus({ variables: { messageId: d._id } }).catch(
              () => {},
            );
        }
        setRecentConvs((prev) => {
          const existing = prev.find((r) => r._id === otherId);
          const entry: RecentConversation = {
            _id: otherId,
            memberNick: existing?.memberNick ?? otherId,
            memberImage: existing?.memberImage,
            lastMessage: d.messageText,
            lastMessageAt: d.createdAt,
          };
          const updated = [
            entry,
            ...prev.filter((r) => r._id !== otherId),
          ].slice(0, 10);
          localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
          return updated;
        });
      } catch {}
    };
    socket.addEventListener("message", handler);
    return () => socket.removeEventListener("message", handler);
  }, [socket, activeMemberId, user._id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (activeMemberId) inputRef.current?.focus();
  }, [activeMemberId]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeMemberId || !socket) return;
    if (socket.readyState !== WebSocket.OPEN) return;
    socket.send(
      JSON.stringify({
        event: "createMessage",
        data: JSON.stringify({
          receiverId: activeMemberId,
          text: inputText.trim(),
        }),
      }),
    );
    setInputText("");
  };

  const activeMember = memberData?.getMember;
  const filtered = recentConvs.filter((c) =>
    c.memberNick.toLowerCase().includes(search.toLowerCase()),
  );

  if (!user._id) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f7f5]">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-[#fff3ee]">
            <HugeiconsIcon
              icon={Message01Icon}
              size={28}
              color="#F25912"
              strokeWidth={1.5}
            />
          </div>
          <h2 className="text-xl font-extrabold mb-2 text-[#222831]">
            Sign in to view messages
          </h2>
          <p className="text-sm mb-6 text-[#9ca3af]">
            You need to be logged in to access your conversations.
          </p>
          <Button
            onClick={() => router.push("/account")}
            className="rounded-full bg-[#F25912] hover:bg-[#D94E0F] text-white font-bold px-6"
          >
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div
        className="flex overflow-hidden"
        style={{ height: "calc(100vh - 72px)", background: "#f7f7f5" }}
      >
        {/* ══ SIDEBAR ══════════════════════════════════════════════════ */}
        <aside
          className={`shrink-0 flex flex-col bg-white border-r border-[#ebebeb] w-full md:w-80 ${
            activeMemberId ? "hidden md:flex" : "flex"
          }`}
        >
          {/* Sidebar header */}
          <div className="shrink-0 px-5 pt-5 pb-4 border-b border-[#ebebeb]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => router.back()}
                  className="h-8 w-8 rounded-lg bg-[#f7f7f5] border border-[#ebebeb] hover:bg-[#ebebeb] text-[#6b7280]"
                >
                  <HugeiconsIcon
                    icon={ArrowLeft01Icon}
                    size={15}
                    color="currentColor"
                    strokeWidth={2}
                  />
                </Button>
                <div>
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <div className="h-[2px] w-4 rounded bg-[#F25912]" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#F25912]">
                      Inbox
                    </span>
                  </div>
                  <p className="text-sm font-extrabold leading-none text-[#222831]">
                    Messages
                  </p>
                </div>
              </div>
              {recentConvs.length > 0 && (
                <Badge
                  variant="secondary"
                  className="text-[11px] font-bold bg-[#f3f4f6] text-[#6b7280] border-0 rounded-full"
                >
                  {recentConvs.length}
                </Badge>
              )}
            </div>

            {/* Search */}
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <HugeiconsIcon
                  icon={Search01Icon}
                  size={13}
                  color="#9ca3af"
                  strokeWidth={1.5}
                />
              </div>
              <Input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search conversations…"
                className="pl-8 h-9 rounded-xl border-[#ebebeb] bg-[#f9fafb] text-xs text-[#374151] focus-visible:ring-[#F25912] focus-visible:border-[#F25912]"
              />
            </div>
          </div>

          {/* Conversations list */}
          <ScrollArea className="flex-1">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-6 text-center py-16">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3 bg-[#fff3ee]">
                  <HugeiconsIcon
                    icon={Message01Icon}
                    size={22}
                    color="#F25912"
                    strokeWidth={1.5}
                  />
                </div>
                <p className="text-sm font-bold mb-1 text-[#222831]">
                  {search ? "No results found" : "No conversations yet"}
                </p>
                <p className="text-xs leading-relaxed text-[#9ca3af]">
                  {search
                    ? `No matches for "${search}"`
                    : "Visit an agent's profile to start messaging."}
                </p>
              </div>
            ) : (
              <div className="py-1.5">
                {filtered.map((conv) => {
                  const isActive = conv._id === activeMemberId;
                  return (
                    <button
                      key={conv._id}
                      onClick={() =>
                        router.push(`/messages?memberId=${conv._id}`)
                      }
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                        isActive
                          ? "bg-[#fff3ee] border-l-2 border-[#F25912]"
                          : "border-l-2 border-transparent hover:bg-[#f9fafb]"
                      }`}
                    >
                      <MemberAvatar
                        image={conv.memberImage}
                        nick={conv.memberNick}
                        size="md"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between gap-2 mb-0.5">
                          <p
                            className={`text-sm font-semibold truncate ${
                              isActive ? "text-[#F25912]" : "text-[#222831]"
                            }`}
                          >
                            {conv.memberNick}
                          </p>
                          {conv.lastMessageAt && (
                            <span className="text-[10px] shrink-0 text-[#9ca3af]">
                              {formatRelative(conv.lastMessageAt)}
                            </span>
                          )}
                        </div>
                        {conv.lastMessage && (
                          <p className="text-xs truncate text-[#9ca3af]">
                            {conv.lastMessage}
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </ScrollArea>

          {/* Bottom CTA */}
          <div className="shrink-0 p-4 border-t border-[#ebebeb]">
            <Button
              variant="outline"
              onClick={() => router.push("/agent")}
              className="w-full rounded-xl text-xs font-bold border-[#ebebeb] text-[#6b7280] hover:bg-[#fff3ee] hover:text-[#F25912] hover:border-[#F25912] transition-colors"
            >
              + New Conversation
            </Button>
          </div>
        </aside>

        {/* ══ CHAT PANEL ═══════════════════════════════════════════════ */}
        <main
          className={`flex-1 flex flex-col overflow-hidden ${
            !activeMemberId ? "hidden md:flex" : "flex"
          }`}
        >
          {activeMemberId && activeMember ? (
            <>
              {/* Conversation header */}
              <div className="flex items-center gap-3 px-4 md:px-6 shrink-0 h-16 bg-white border-b border-[#ebebeb]">
                {/* Mobile back */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => router.push("/messages")}
                  className="md:hidden h-8 w-8 rounded-lg shrink-0 text-[#6b7280]"
                >
                  <HugeiconsIcon
                    icon={ArrowLeft01Icon}
                    size={16}
                    color="currentColor"
                    strokeWidth={2}
                  />
                </Button>

                <div className="h-9 w-[3px] rounded-full shrink-0 bg-[#F25912]" />

                <MemberAvatar
                  image={activeMember.memberImage}
                  nick={activeMember.memberNick}
                  size="md"
                />

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-extrabold leading-none mb-1 truncate text-[#222831]">
                    {activeMember.memberNick}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-[#22c55e]" />
                    <Badge
                      variant="secondary"
                      className="text-[10px] font-medium bg-[#f3f4f6] text-[#9ca3af] border-0 rounded-full px-2 py-0 h-auto"
                    >
                      {activeMember.memberType}
                    </Badge>
                  </div>
                </div>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        router.push(`/agent/details?agentId=${activeMemberId}`)
                      }
                      className="shrink-0 rounded-xl border-[#ebebeb] text-[#6b7280] hover:bg-[#fff3ee] hover:text-[#F25912] hover:border-[#F25912] transition-colors gap-1.5"
                    >
                      <HugeiconsIcon
                        icon={UserEdit01Icon}
                        size={14}
                        color="currentColor"
                        strokeWidth={1.5}
                      />
                      <span className="hidden sm:inline text-xs font-semibold">
                        View Profile
                      </span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>View agent profile</p>
                  </TooltipContent>
                </Tooltip>
              </div>

              {/* Messages area */}
              <ScrollArea className="flex-1 bg-[#f7f7f5]">
                <div className="px-5 md:px-8 py-5">
                  {messagesLoading ? (
                    <div className="flex flex-col gap-4 pt-4">
                      {[
                        { w: "w-44", own: false },
                        { w: "w-60", own: true },
                        { w: "w-36", own: false },
                        { w: "w-72", own: true },
                        { w: "w-52", own: false },
                        { w: "w-40", own: true },
                      ].map((item, i) => (
                        <div
                          key={i}
                          className={`flex ${item.own ? "justify-end" : "justify-start"}`}
                        >
                          <Skeleton className={`h-10 ${item.w} rounded-2xl`} />
                        </div>
                      ))}
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                      <div className="w-16 h-16 rounded-3xl flex items-center justify-center mb-4 bg-[#fff3ee]">
                        <HugeiconsIcon
                          icon={Message01Icon}
                          size={28}
                          color="#F25912"
                          strokeWidth={1.5}
                        />
                      </div>
                      <p className="text-base font-extrabold mb-1 text-[#222831]">
                        No messages yet
                      </p>
                      <p className="text-sm text-[#9ca3af]">
                        Say hello to {activeMember.memberNick}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-0.5">
                      {messages.map((msg, idx) => {
                        const isOwn = msg.senderId === user._id;
                        const prevMsg = messages[idx - 1];
                        const nextMsg = messages[idx + 1];
                        const showDate =
                          idx === 0 ||
                          formatDate(prevMsg.createdAt) !==
                            formatDate(msg.createdAt);
                        const isLastInGroup =
                          !nextMsg || nextMsg.senderId !== msg.senderId;

                        return (
                          <div key={msg._id || idx}>
                            {showDate && (
                              <div className="flex items-center justify-center my-5">
                                <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-[#ebebeb] text-[#9ca3af] uppercase tracking-wide">
                                  {formatDate(msg.createdAt)}
                                </span>
                              </div>
                            )}
                            <div
                              className={`flex gap-2.5 ${isOwn ? "flex-row-reverse" : "flex-row"}`}
                              style={{
                                marginBottom: isLastInGroup ? "14px" : "3px",
                              }}
                            >
                              {!isOwn && (
                                <div className="w-7 shrink-0 self-end">
                                  {isLastInGroup && (
                                    <MemberAvatar
                                      image={activeMember.memberImage}
                                      nick={activeMember.memberNick}
                                      size="sm"
                                    />
                                  )}
                                </div>
                              )}
                              <div
                                className={`flex flex-col max-w-[62%] ${
                                  isOwn ? "items-end" : "items-start"
                                }`}
                              >
                                <div
                                  className="px-4 py-2.5"
                                  style={
                                    isOwn
                                      ? {
                                          background: "#F25912",
                                          color: "#fff",
                                          borderRadius: "18px 18px 4px 18px",
                                        }
                                      : {
                                          background: "#fff",
                                          color: "#222831",
                                          border: "1px solid #ebebeb",
                                          borderRadius: "18px 18px 18px 4px",
                                        }
                                  }
                                >
                                  <p className="text-sm leading-relaxed break-words">
                                    {msg.messageText}
                                  </p>
                                </div>
                                {isLastInGroup && (
                                  <div
                                    className={`flex items-center gap-1 mt-1.5 px-1 ${
                                      isOwn ? "flex-row-reverse" : "flex-row"
                                    }`}
                                  >
                                    <span className="text-[10px] text-[#9ca3af]">
                                      {formatTime(msg.createdAt)}
                                    </span>
                                    {isOwn && (
                                      <HugeiconsIcon
                                        icon={
                                          msg.messageStatus === "READ"
                                            ? TickDouble01Icon
                                            : Tick01Icon
                                        }
                                        size={12}
                                        color={
                                          msg.messageStatus === "READ"
                                            ? "#F25912"
                                            : "#9ca3af"
                                        }
                                        strokeWidth={2}
                                      />
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Input bar */}
              <form
                onSubmit={sendMessage}
                className="flex items-center gap-3 px-4 md:px-6 py-4 shrink-0 bg-white border-t border-[#ebebeb]"
              >
                <div className="flex-1 relative">
                  <Input
                    ref={inputRef}
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={`Message ${activeMember.memberNick}…`}
                    maxLength={1000}
                    className="h-11 rounded-2xl border-[#ebebeb] bg-[#f7f7f5] text-sm text-[#222831] focus-visible:ring-[#F25912] focus-visible:border-[#F25912] pr-12"
                  />
                  {inputText.length > 800 && (
                    <span
                      className={`absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold pointer-events-none ${
                        inputText.length > 950
                          ? "text-red-500"
                          : "text-[#9ca3af]"
                      }`}
                    >
                      {1000 - inputText.length}
                    </span>
                  )}
                </div>
                <Button
                  type="submit"
                  size="icon"
                  disabled={
                    !inputText.trim() ||
                    !socket ||
                    socket.readyState !== WebSocket.OPEN
                  }
                  className="h-11 w-11 rounded-xl bg-[#F25912] hover:bg-[#D94E0F] text-white shrink-0 shadow-[0_4px_14px_rgba(242,89,18,0.28)] disabled:opacity-40"
                >
                  <HugeiconsIcon
                    icon={Navigation03Icon}
                    size={19}
                    color="white"
                    strokeWidth={1.5}
                  />
                </Button>
              </form>
            </>
          ) : (
            /* Empty state — no conversation selected */
            <div className="flex-1 flex flex-col items-center justify-center text-center px-8 bg-[#f7f7f5]">
              <div className="flex items-center gap-1.5 mb-6 opacity-25">
                {[36, 20, 12, 20, 36].map((w, i) => (
                  <div
                    key={i}
                    className="h-[2px] rounded-full bg-[#F25912]"
                    style={{ width: w }}
                  />
                ))}
              </div>
              <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-5 bg-[#fff3ee]">
                <HugeiconsIcon
                  icon={Message01Icon}
                  size={36}
                  color="#F25912"
                  strokeWidth={1.5}
                />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <div className="h-[2px] w-4 rounded bg-[#F25912]" />
                <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#F25912]">
                  Direct Messages
                </span>
                <div className="h-[2px] w-4 rounded bg-[#F25912]" />
              </div>
              <h2 className="text-2xl font-extrabold mb-2 text-[#222831]">
                Your Messages
              </h2>
              <p className="text-sm leading-relaxed max-w-sm mb-7 text-[#9ca3af]">
                Send private messages to agents about properties you're
                interested in. Select a conversation or start a new one.
              </p>
              <Button
                onClick={() => router.push("/agent")}
                className="rounded-full bg-[#F25912] hover:bg-[#D94E0F] text-white font-bold px-6 shadow-[0_4px_14px_rgba(242,89,18,0.28)]"
              >
                Browse Agents
              </Button>
            </div>
          )}
        </main>
      </div>
    </TooltipProvider>
  );
};

export default MessagesPage;
