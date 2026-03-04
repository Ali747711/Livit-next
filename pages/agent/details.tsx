import { userVar } from "@/apollo/store";
import { CREATE_COMMENT, LIKE_TARGET_PROPERTY } from "@/apollo/user/mutation";
import { GET_COMMENTS, GET_MEMBER, GET_PROPERTIES } from "@/apollo/user/query";
import { Messages } from "@/lib/config";
import { CommentGroup } from "@/lib/enums/comment";
import { Comment } from "@/lib/types/comment/comment";
import {
  CommentInput,
  CommentsInquiry,
} from "@/lib/types/comment/comment.input";
import { Member } from "@/lib/types/member/member";
import { Property } from "@/lib/types/property/property";
import { PropertiesInquiry } from "@/lib/types/property/property.input";
import { useMutation, useQuery, useReactiveVar } from "@apollo/client/react";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Location01Icon,
  CallIcon,
  Mail01Icon,
  EyeIcon,
  Building01Icon,
  ArrowLeft01Icon,
  FavouriteIcon,
  ArrowRight01Icon,
  StarIcon,
  MessageIcon,
  UserIcon,
} from "@hugeicons/core-free-icons";
import { getImageUrl } from "@/lib/utils";
import PropertyCard from "@/components/property/PropertyCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const defaultInput = {
  page: 1,
  limit: 9,
  sort: "createdAt",
  direction: "DESC",
  search: {},
};
const defaultComment = {
  page: 1,
  limit: 5,
  sort: "createdAt",
  direction: "ASC",
  search: { commentRefId: "" },
};

const getRankLabel = (rank: number) => {
  if (rank >= 80) return "Elite Agent";
  if (rank >= 60) return "Premium Agent";
  if (rank >= 40) return "Pro Agent";
  return "Agent";
};

const AgentDetails: NextPage = ({
  initialInput = defaultInput,
  initialComment = defaultComment,
}: any) => {
  const router = useRouter();
  const user = useReactiveVar(userVar);

  const [agentId, setAgentId] = useState<string | null>(null);
  const [agent, setAgent] = useState<Member | null>(null);
  const [searchFilter, setSearchFilter] =
    useState<PropertiesInquiry>(initialInput);
  const [agentProperties, setAgentProperties] = useState<Property[]>([]);
  const [propertyTotal, setPropertyTotal] = useState<number>(0);
  const [commentInquiry, setCommentInquiry] =
    useState<CommentsInquiry>(initialComment);
  const [agentComments, setAgentComments] = useState<Comment[]>([]);
  const [commentTotal, setCommentTotal] = useState<number>(0);
  const [insertCommentData, setInsertCommentData] = useState<CommentInput>({
    commentGroup: CommentGroup.MEMBER,
    commentContent: "",
    commentRefId: "",
  });

  const [createComment] = useMutation(CREATE_COMMENT);
  const [likeTargetProperty] = useMutation(LIKE_TARGET_PROPERTY);

  const { loading: getMemberLoading, data: MemberData } = useQuery<any>(
    GET_MEMBER,
    {
      fetchPolicy: "network-only",
      variables: { input: agentId },
      skip: !agentId,
    },
  );

  const {
    data: PropertyData,
    loading: getPropertyLoading,
    refetch: getPropertyRefetch,
  } = useQuery<any>(GET_PROPERTIES, {
    fetchPolicy: "network-only",
    variables: { input: searchFilter },
    skip: !searchFilter.search.memberId,
    notifyOnNetworkStatusChange: true,
  });

  const {
    data: CommentData,
    loading: getCommentLoading,
    refetch: getCommentRefetch,
  } = useQuery<any>(GET_COMMENTS, {
    fetchPolicy: "network-only",
    variables: { input: commentInquiry },
    skip: !commentInquiry.search.commentRefId,
    notifyOnNetworkStatusChange: true,
  });

  useEffect(() => {
    setAgent(MemberData?.getMember);
    if (MemberData?.getMember?._id) {
      setSearchFilter((p) => ({
        ...p,
        search: { memberId: MemberData.getMember._id },
      }));
      setCommentInquiry((p) => ({
        ...p,
        search: { commentRefId: MemberData.getMember._id },
      }));
      setInsertCommentData((p) => ({
        ...p,
        commentRefId: MemberData.getMember._id,
      }));
    }
  }, [MemberData]);

  useEffect(() => {
    setAgentProperties(PropertyData?.getProperties?.list ?? []);
    setPropertyTotal(PropertyData?.getProperties?.metaCounter[0]?.total ?? 0);
  }, [PropertyData]);

  useEffect(() => {
    setAgentComments(CommentData?.getComments?.list ?? []);
    setCommentTotal(CommentData?.getComments?.metaCounter[0]?.total ?? 0);
  }, [CommentData]);

  useEffect(() => {
    if (router.query?.agentId) setAgentId(router.query.agentId as string);
  }, [router]);

  const likePropertyHandler = async (user: any, id: string) => {
    try {
      if (!id || !user._id) {
        toast.error("Please login first");
        return;
      }
      await likeTargetProperty({ variables: { input: id } });
      await getPropertyRefetch({ input: searchFilter });
      toast.success("Property liked!");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const createCommentHandler = async () => {
    try {
      if (!user._id) throw new Error(Messages.error2);
      if (user._id === agentId) throw new Error("Cannot review yourself");
      await createComment({ variables: { input: insertCommentData } });
      setInsertCommentData((p) => ({ ...p, commentContent: "" }));
      await getCommentRefetch({ input: commentInquiry });
      toast.success("Review posted!");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const formatDate = (d: string | Date) =>
    new Date(d).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  // ── Loading state ──────────────────────────────────────────────────────────
  if (getMemberLoading) {
    return (
      <div className="min-h-screen bg-[#f7f7f5]">
        <div className="container mx-auto px-6 max-w-5xl pt-10 pb-20">
          <Skeleton className="h-5 w-32 mb-6" />
          <div className="rounded-2xl bg-white border border-[#ebebeb] p-8 mb-6">
            <div className="flex flex-col sm:flex-row items-start gap-7">
              <Skeleton className="h-30 w-30 rounded-2xl shrink-0" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
              <div className="flex flex-col gap-2 shrink-0">
                <Skeleton className="h-10 w-36 rounded-full" />
                <Skeleton className="h-10 w-36 rounded-full" />
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 mt-7 pt-6 border-t border-[#f3f4f6]">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="flex flex-col items-center gap-2 py-3">
                  <Skeleton className="h-5 w-5 rounded" />
                  <Skeleton className="h-6 w-8" />
                  <Skeleton className="h-3 w-14" />
                </div>
              ))}
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-75 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#f7f7f5]">
        <p className="font-semibold text-[#222831]">Agent not found</p>
        <Button
          className="rounded-full bg-[#F25912] hover:bg-[#D94E0F] text-white font-bold"
          onClick={() => router.push("/agent")}
        >
          Back to Agents
        </Button>
      </div>
    );
  }

  // ── Main render ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#f7f7f5]">
      <div className="container mx-auto px-6 max-w-5xl pt-10 pb-20">
        {/* Back link */}
        <Button
          variant="ghost"
          className="flex items-center gap-1.5 mb-6 text-sm font-semibold text-[#9ca3af] hover:text-[#F25912] hover:bg-transparent p-0 h-auto"
          onClick={() => router.back()}
        >
          <HugeiconsIcon
            icon={ArrowLeft01Icon}
            size={15}
            color="currentColor"
            strokeWidth={2.5}
          />
          Back to Agents
        </Button>

        {/* ── Profile card ─────────────────────────────────────────────── */}
        <div className="rounded-2xl overflow-hidden mb-6 bg-white border border-[#ebebeb]">
          <div className="p-8">
            <div className="flex flex-col sm:flex-row items-start gap-7">
              {/* Avatar */}
              <div className="relative shrink-0">
                <Avatar className="h-30 w-30 rounded-2xl border border-[#ebebeb]">
                  {agent.memberImage && (
                    <AvatarImage
                      src={getImageUrl(agent.memberImage)}
                      alt={agent.memberFullName}
                      className="object-cover"
                    />
                  )}
                  <AvatarFallback className="rounded-2xl bg-[#f3f4f6] text-[#9ca3af] text-3xl font-semibold">
                    {agent.memberNick?.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {agent.memberStatus === "ACTIVE" && (
                  <span className="absolute bottom-2 right-2 block w-3 h-3 rounded-full bg-green-500 border-2 border-white" />
                )}
              </div>

              {/* Text info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-0.5 w-4 bg-[#F25912]" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#F25912]">
                    {getRankLabel(agent.memberRank)}
                  </span>
                </div>

                <h1 className="text-2xl md:text-3xl font-extrabold leading-tight mb-1 text-[#222831]">
                  {agent.memberFullName}
                </h1>
                <p className="text-sm mb-3 text-[#9ca3af]">
                  @{agent.memberNick}
                </p>

                {agent.memberAddress && (
                  <div className="flex items-center gap-1.5 mb-3">
                    <HugeiconsIcon
                      icon={Location01Icon}
                      size={13}
                      color="#F25912"
                      strokeWidth={1.5}
                    />
                    <span className="text-sm text-[#6b7280]">
                      {agent.memberAddress}
                    </span>
                  </div>
                )}

                {agent.memberDesc && (
                  <p className="text-sm leading-relaxed text-[#6b7280]">
                    {agent.memberDesc}
                  </p>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex flex-col gap-2 shrink-0">
                <Button
                  className="flex items-center gap-2 rounded-full bg-[#F25912] hover:bg-[#D94E0F] text-white font-bold shadow-[0_4px_14px_rgba(242,89,18,0.28)]"
                  asChild
                >
                  <a href={`tel:${agent.memberPhone}`}>
                    <HugeiconsIcon
                      icon={CallIcon}
                      size={15}
                      color="white"
                      strokeWidth={2}
                    />
                    Call Agent
                  </a>
                </Button>
                <Button
                  variant="outline"
                  className="flex items-center gap-2 rounded-full border-[#ebebeb] text-[#6b7280] hover:border-[#222831] hover:text-[#222831] font-bold"
                  asChild
                >
                  <a href="mailto:contact@agent.com">
                    <HugeiconsIcon
                      icon={Mail01Icon}
                      size={15}
                      color="currentColor"
                      strokeWidth={1.5}
                    />
                    Send Email
                  </a>
                </Button>
                {user._id && user._id !== agent._id && (
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 rounded-full border-[#F25912] text-[#F25912] hover:bg-[#F25912] hover:text-white font-bold"
                    onClick={() =>
                      router.push(`/messages?memberId=${agent._id}`)
                    }
                  >
                    <HugeiconsIcon
                      icon={MessageIcon}
                      size={15}
                      color="currentColor"
                      strokeWidth={1.5}
                    />
                    Message Agent
                  </Button>
                )}
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 md:grid-cols-5 mt-7 pt-6 border-t border-[#f3f4f6]">
              {[
                {
                  icon: Building01Icon,
                  value: agent.memberProperties,
                  label: "Properties",
                },
                {
                  icon: FavouriteIcon,
                  value: agent.memberLikes,
                  label: "Likes",
                },
                { icon: EyeIcon, value: agent.memberViews, label: "Views" },
                {
                  icon: UserIcon,
                  value: agent.memberFollowers ?? 0,
                  label: "Followers",
                },
                { icon: StarIcon, value: agent.memberPoints, label: "Points" },
              ].map(({ icon, value, label }, i, arr) => (
                <div
                  key={label}
                  className={`flex flex-col items-center py-3 ${
                    i < arr.length - 1 ? "border-r border-[#f3f4f6]" : ""
                  }`}
                >
                  <HugeiconsIcon
                    icon={icon}
                    size={17}
                    color="#F25912"
                    strokeWidth={1.5}
                  />
                  <span className="text-xl font-extrabold mt-1 text-[#222831]">
                    {value}
                  </span>
                  <span className="text-[11px] font-medium text-[#9ca3af]">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Properties & Reviews — tabbed ──────────────────────────── */}
        <Tabs defaultValue="properties" className="w-full">
          <TabsList className="h-auto bg-[#f3f4f6] rounded-xl p-1 mb-8 w-full sm:w-auto">
            <TabsTrigger
              value="properties"
              className="rounded-lg text-sm font-semibold px-5 py-2 data-[state=active]:bg-white data-[state=active]:text-[#F25912] data-[state=active]:shadow-sm"
            >
              Properties ({propertyTotal})
            </TabsTrigger>
            <TabsTrigger
              value="reviews"
              className="rounded-lg text-sm font-semibold px-5 py-2 data-[state=active]:bg-white data-[state=active]:text-[#F25912] data-[state=active]:shadow-sm"
            >
              Reviews ({commentTotal})
            </TabsTrigger>
          </TabsList>

          {/* Properties tab */}
          <TabsContent value="properties" className="mt-0">
            {getPropertyLoading ? (
              <div className="grid md:grid-cols-2 gap-5">
                {[0, 1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-75 rounded-2xl" />
                ))}
              </div>
            ) : agentProperties?.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-5">
                {agentProperties.map((property) => (
                  <PropertyCard
                    key={property._id}
                    property={property}
                    onLike={(id: string) => likePropertyHandler(user, id)}
                    likeLoading={getPropertyLoading}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl flex flex-col items-center justify-center py-16 bg-white border border-[#ebebeb]">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 bg-[#f3f4f6]">
                  <HugeiconsIcon
                    icon={Building01Icon}
                    size={28}
                    color="#d1d5db"
                    strokeWidth={1}
                  />
                </div>
                <p className="text-sm text-[#9ca3af]">
                  No properties listed yet
                </p>
              </div>
            )}
          </TabsContent>

          {/* Reviews tab */}
          <TabsContent value="reviews" className="mt-0">
            <div className="space-y-4">
              {/* Write a review */}
              {user._id && user._id !== agentId && (
                <div className="rounded-2xl p-6 bg-white border border-[#ebebeb]">
                  <div className="flex items-center gap-2 mb-4">
                    <HugeiconsIcon
                      icon={MessageIcon}
                      size={16}
                      color="#F25912"
                      strokeWidth={1.5}
                    />
                    <span className="text-sm font-extrabold text-[#222831]">
                      Write a Review
                    </span>
                  </div>
                  <Textarea
                    value={insertCommentData.commentContent}
                    onChange={(e) =>
                      setInsertCommentData((p) => ({
                        ...p,
                        commentContent: e.target.value,
                      }))
                    }
                    placeholder="Share your experience with this agent…"
                    className="min-h-27.5 resize-none rounded-xl border-[#ebebeb] bg-[#f9fafb] text-[#374151] text-sm focus-visible:ring-[#F25912] focus-visible:ring-1 focus-visible:border-[#F25912]"
                  />
                  <Button
                    onClick={createCommentHandler}
                    disabled={!insertCommentData.commentContent.trim()}
                    className="mt-3 w-full rounded-xl bg-[#F25912] hover:bg-[#D94E0F] text-white font-bold gap-2 disabled:opacity-40"
                  >
                    <HugeiconsIcon
                      icon={ArrowRight01Icon}
                      size={15}
                      color="white"
                      strokeWidth={2.5}
                    />
                    Post Review
                  </Button>
                </div>
              )}

              {/* Reviews list */}
              {getCommentLoading ? (
                <div className="space-y-4">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="rounded-2xl bg-white border border-[#ebebeb] p-5"
                    >
                      <div className="flex items-start gap-4">
                        <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-40" />
                          <Skeleton className="h-3 w-full" />
                          <Skeleton className="h-3 w-3/4" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : agentComments?.length > 0 ? (
                agentComments.map((comment) => (
                  <div
                    key={comment._id}
                    className="rounded-2xl p-5 bg-white border border-[#ebebeb]"
                  >
                    <div className="flex items-start gap-4">
                      <Avatar className="h-10 w-10 rounded-xl shrink-0">
                        {comment.memberData?.memberImage && (
                          <AvatarImage
                            src={getImageUrl(comment.memberData.memberImage)}
                            alt={comment.memberData.memberFullName}
                            className="object-cover"
                          />
                        )}
                        <AvatarFallback className="rounded-xl bg-[#f3f4f6] text-[#9ca3af] text-sm font-semibold">
                          {(
                            comment.memberData?.memberNick ??
                            comment.memberData?.memberFullName ??
                            "?"
                          )
                            .slice(0, 2)
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-sm font-bold text-[#222831]">
                            {comment.memberData?.memberFullName
                              ? comment.memberData?.memberFullName
                              : comment.memberData?.memberNick}
                          </span>
                          <span className="text-xs text-[#9ca3af]">
                            {formatDate(comment.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm leading-relaxed text-[#6b7280]">
                          {comment.commentContent}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl flex flex-col items-center justify-center py-14 bg-white border border-[#ebebeb]">
                  <HugeiconsIcon
                    icon={MessageIcon}
                    size={32}
                    color="#e5e7eb"
                    strokeWidth={1}
                  />
                  <p className="mt-3 text-sm text-[#9ca3af]">
                    No reviews yet — be the first!
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AgentDetails;
