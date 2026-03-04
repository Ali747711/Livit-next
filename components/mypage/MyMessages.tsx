import React, { useState, useEffect, useRef } from "react";
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
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
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

type AvatarSize = "xs" | "sm" | "md";
const sizeMap: Record<AvatarSize, string> = {
  xs: "h-6 w-6",
  sm: "h-7 w-7",
  md: "h-9 w-9",
};
const textSizeMap: Record<AvatarSize, string> = {
  xs: "text-[9px]",
  sm: "text-[10px]",
  md: "text-xs",
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

const MyMessages: React.FC = () => {
  const router = useRouter();
  const user = useReactiveVar(userVar);
  const socket = useReactiveVar(socketVar);

  const [activeMemberId, setActiveMemberId] = useState<string | undefined>(
    router.query.memberId as string | undefined,
  );
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
    if (router.query.memberId)
      setActiveMemberId(router.query.memberId as string);
  }, [router.query.memberId]);

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

  useEffect(() => {
    setMessages([]);
    setInputText("");
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

  return (
    <TooltipProvider>
      <div
        className="flex overflow-hidden rounded-2xl border border-[#ebebeb] bg-white"
        style={{ height: "calc(100vh - 240px)", minHeight: "540px" }}
      >
        {/* ══ SIDEBAR ══════════════════════════════════════════════════ */}
        <aside
          className={`shrink-0 flex flex-col bg-[#f7f7f5] border-r border-[#ebebeb] w-full sm:w-60 ${
            activeMemberId ? "hidden sm:flex" : "flex"
          }`}
        >
          {/* Header */}
          <div className="shrink-0 px-4 pt-4 pb-3 border-b border-[#ebebeb]">
            <div className="flex items-center gap-1.5 mb-2">
              <div className="h-[2px] w-3 rounded bg-[#F25912]" />
              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#F25912]">
                Inbox
              </span>
            </div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-extrabold text-[#222831]">
                Conversations
              </p>
              {recentConvs.length > 0 && (
                <Badge
                  variant="secondary"
                  className="text-[10px] font-bold bg-[#ebebeb] text-[#6b7280] border-0 rounded-full"
                >
                  {recentConvs.length}
                </Badge>
              )}
            </div>

            {/* Search */}
            <div className="relative">
              <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                <HugeiconsIcon
                  icon={Search01Icon}
                  size={12}
                  color="#9ca3af"
                  strokeWidth={1.5}
                />
              </div>
              <Input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search…"
                className="pl-7 h-8 rounded-lg border-[#ebebeb] bg-white text-[11px] text-[#374151] focus-visible:ring-[#F25912] focus-visible:border-[#F25912]"
              />
            </div>
          </div>

          {/* List */}
          <ScrollArea className="flex-1">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-4 text-center py-10">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-2 bg-[#fff3ee]">
                  <HugeiconsIcon
                    icon={Message01Icon}
                    size={18}
                    color="#F25912"
                    strokeWidth={1.5}
                  />
                </div>
                <p className="text-xs font-bold mb-1 text-[#222831]">
                  {search ? "No results" : "No conversations"}
                </p>
                <p className="text-[11px] leading-relaxed text-[#9ca3af]">
                  {search
                    ? `No matches for "${search}"`
                    : "Visit an agent profile to start."}
                </p>
              </div>
            ) : (
              <div className="py-1">
                {filtered.map((conv) => {
                  const isActive = conv._id === activeMemberId;
                  return (
                    <button
                      key={conv._id}
                      onClick={() => setActiveMemberId(conv._id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-colors ${
                        isActive
                          ? "bg-[#fff3ee] border-l-2 border-[#F25912]"
                          : "border-l-2 border-transparent hover:bg-white"
                      }`}
                    >
                      <MemberAvatar
                        image={conv.memberImage}
                        nick={conv.memberNick}
                        size="sm"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between gap-1 mb-0.5">
                          <p
                            className={`text-xs font-semibold truncate ${
                              isActive ? "text-[#F25912]" : "text-[#222831]"
                            }`}
                          >
                            {conv.memberNick}
                          </p>
                          {conv.lastMessageAt && (
                            <span className="text-[9px] shrink-0 text-[#9ca3af]">
                              {formatRelative(conv.lastMessageAt)}
                            </span>
                          )}
                        </div>
                        {conv.lastMessage && (
                          <p className="text-[11px] truncate text-[#9ca3af]">
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
          <div className="shrink-0 p-3 border-t border-[#ebebeb]">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/agent")}
              className="w-full rounded-lg text-[11px] font-bold border-[#ebebeb] bg-white text-[#6b7280] hover:bg-[#fff3ee] hover:text-[#F25912] hover:border-[#F25912] transition-colors"
            >
              + New Conversation
            </Button>
          </div>
        </aside>

        {/* ══ CHAT PANEL ═══════════════════════════════════════════════ */}
        <main
          className={`flex-1 flex flex-col overflow-hidden ${
            !activeMemberId ? "hidden sm:flex" : "flex"
          }`}
        >
          {activeMemberId && activeMember ? (
            <>
              {/* Header */}
              <div className="flex items-center gap-2.5 px-4 shrink-0 h-14 bg-white border-b border-[#ebebeb]">
                {/* Mobile back */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setActiveMemberId(undefined)}
                  className="sm:hidden h-7 w-7 rounded-lg shrink-0 text-[#6b7280]"
                >
                  <HugeiconsIcon
                    icon={ArrowLeft01Icon}
                    size={14}
                    color="currentColor"
                    strokeWidth={2}
                  />
                </Button>

                <div className="h-7 w-[3px] rounded-full shrink-0 bg-[#F25912]" />

                <MemberAvatar
                  image={activeMember.memberImage}
                  nick={activeMember.memberNick}
                  size="md"
                />

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-extrabold leading-none mb-0.5 truncate text-[#222831]">
                    {activeMember.memberNick}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-[#22c55e]" />
                    <p className="text-[10px] text-[#9ca3af]">
                      {activeMember.memberType}
                    </p>
                  </div>
                </div>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        router.push(`/agent/details?agentId=${activeMemberId}`)
                      }
                      className="shrink-0 h-8 w-8 rounded-lg text-[#9ca3af] hover:bg-[#fff3ee] hover:text-[#F25912] transition-colors"
                    >
                      <HugeiconsIcon
                        icon={UserEdit01Icon}
                        size={15}
                        color="currentColor"
                        strokeWidth={1.5}
                      />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>View agent profile</p>
                  </TooltipContent>
                </Tooltip>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 bg-[#f7f7f5]">
                <div className="px-4 md:px-5 py-4">
                  {messagesLoading ? (
                    <div className="flex flex-col gap-3 pt-2">
                      {[
                        { w: "w-32", own: false },
                        { w: "w-48", own: true },
                        { w: "w-28", own: false },
                        { w: "w-56", own: true },
                        { w: "w-40", own: false },
                        { w: "w-36", own: true },
                      ].map((item, i) => (
                        <div
                          key={i}
                          className={`flex ${item.own ? "justify-end" : "justify-start"}`}
                        >
                          <Skeleton className={`h-9 ${item.w} rounded-2xl`} />
                        </div>
                      ))}
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center min-h-[300px] text-center">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3 bg-[#fff3ee]">
                        <HugeiconsIcon
                          icon={Message01Icon}
                          size={22}
                          color="#F25912"
                          strokeWidth={1.5}
                        />
                      </div>
                      <p className="text-sm font-extrabold mb-1 text-[#222831]">
                        No messages yet
                      </p>
                      <p className="text-xs text-[#9ca3af]">
                        Send your first message to {activeMember.memberNick}
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
                              <div className="flex items-center justify-center my-4">
                                <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-[#ebebeb] text-[#9ca3af]">
                                  {formatDate(msg.createdAt)}
                                </span>
                              </div>
                            )}
                            <div
                              className={`flex gap-2 ${isOwn ? "flex-row-reverse" : "flex-row"}`}
                              style={{
                                marginBottom: isLastInGroup ? "10px" : "3px",
                              }}
                            >
                              {!isOwn && (
                                <div className="w-7 shrink-0 self-end">
                                  {isLastInGroup && (
                                    <MemberAvatar
                                      image={activeMember.memberImage}
                                      nick={activeMember.memberNick}
                                      size="xs"
                                    />
                                  )}
                                </div>
                              )}
                              <div
                                className={`flex flex-col max-w-[68%] ${
                                  isOwn ? "items-end" : "items-start"
                                }`}
                              >
                                <div
                                  className="px-3.5 py-2"
                                  style={
                                    isOwn
                                      ? {
                                          background: "#F25912",
                                          color: "#fff",
                                          borderRadius: "16px 16px 4px 16px",
                                        }
                                      : {
                                          background: "#fff",
                                          color: "#222831",
                                          border: "1px solid #ebebeb",
                                          borderRadius: "16px 16px 16px 4px",
                                        }
                                  }
                                >
                                  <p className="text-sm leading-relaxed break-words">
                                    {msg.messageText}
                                  </p>
                                </div>
                                {isLastInGroup && (
                                  <div
                                    className={`flex items-center gap-1 mt-1 px-1 ${
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
                                        size={11}
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

              {/* Input */}
              <form
                onSubmit={sendMessage}
                className="flex items-center gap-2.5 px-3 md:px-4 py-3 shrink-0 bg-white border-t border-[#ebebeb]"
              >
                <div className="flex-1 relative">
                  <Input
                    ref={inputRef}
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={`Message ${activeMember.memberNick}…`}
                    maxLength={1000}
                    className="h-10 rounded-xl border-[#ebebeb] bg-[#f9fafb] text-sm text-[#222831] focus-visible:ring-[#F25912] focus-visible:border-[#F25912] pr-10"
                  />
                  {inputText.length > 800 && (
                    <span
                      className={`absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-bold pointer-events-none ${
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
                  className="h-10 w-10 rounded-xl bg-[#F25912] hover:bg-[#D94E0F] text-white shrink-0 disabled:opacity-40"
                >
                  <HugeiconsIcon
                    icon={Navigation03Icon}
                    size={17}
                    color="white"
                    strokeWidth={1.5}
                  />
                </Button>
              </form>
            </>
          ) : (
            /* Empty state */
            <div className="flex-1 flex flex-col items-center justify-center text-center px-6 bg-white">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 bg-[#fff3ee]">
                <HugeiconsIcon
                  icon={Message01Icon}
                  size={26}
                  color="#F25912"
                  strokeWidth={1.5}
                />
              </div>
              <h3 className="text-base font-extrabold mb-1.5 text-[#222831]">
                Select a conversation
              </h3>
              <p className="text-xs leading-relaxed max-w-[220px] mb-5 text-[#9ca3af]">
                Choose from the sidebar or visit an agent's profile to start
                messaging.
              </p>
              <Button
                onClick={() => router.push("/agent")}
                size="sm"
                className="rounded-full bg-[#F25912] hover:bg-[#D94E0F] text-white font-bold px-5"
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

export default MyMessages;
