import { useRouter } from "next/router";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Location01Icon,
  CallIcon,
  Award01Icon,
  FavouriteIcon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";
import { useReactiveVar } from "@apollo/client/react";
import { userVar } from "@/apollo/store";
import { Member } from "@/lib/types/member/member";
import { getImageUrl } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AgentCardProps {
  agent: Member;
  likeMemberHandler: (user: any, id: string) => void;
}

const getRankLabel = (rank: number) => {
  if (rank >= 80) return "Elite";
  if (rank >= 60) return "Premium";
  if (rank >= 40) return "Pro";
  return "Agent";
};

const AgentCard = ({ agent, likeMemberHandler }: AgentCardProps) => {
  const router = useRouter();
  const user = useReactiveVar(userVar);

  const {
    memberFullName,
    memberNick,
    memberImage,
    memberAddress,
    memberDesc,
    memberPhone,
    memberProperties,
    memberRank,
    memberLikes,
    memberViews,
    memberStatus,
  } = agent;

  return (
    <TooltipProvider>
      <div
        className="group relative rounded-2xl overflow-hidden cursor-pointer bg-white border border-[#ebebeb] shadow-[0_1px_4px_rgba(0,0,0,0.04)] transition-all duration-300 hover:shadow-[0_12px_40px_rgba(0,0,0,0.10)] hover:-translate-y-0.5"
        onClick={() =>
          router.push({ pathname: "/agent/details", query: { agentId: agent._id } })
        }
      >
        {/* ── Image area ──────────────────────────────────────────────── */}
        <div className="relative overflow-hidden h-60">
          {memberImage ? (
            <img
              src={getImageUrl(memberImage)}
              alt={memberFullName}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:scale-[1.06]"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-[#f3f4f6]">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="bg-[#e5e7eb] text-[#9ca3af] text-2xl font-semibold">
                  {memberNick?.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
          )}

          {/* Gradient overlay */}
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(to top, rgba(20,20,20,0.6) 0%, transparent 55%)",
            }}
          />

          {/* Rank badge — top left */}
          <div className="absolute top-3 left-3">
            <Badge className="bg-[#F25912] text-white hover:bg-[#F25912] text-[10px] font-bold uppercase tracking-wide px-2.5 py-0.5 gap-1">
              <HugeiconsIcon icon={Award01Icon} size={10} color="#fff" strokeWidth={2.5} />
              {getRankLabel(memberRank)}
            </Badge>
          </div>

          {/* Active status — top right */}
          {memberStatus === "ACTIVE" && (
            <div className="absolute top-3 right-3 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full animate-pulse bg-green-500" />
              <span className="text-white text-[10px] font-semibold">Active</span>
            </div>
          )}

          {/* Name overlay — bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="text-white font-extrabold text-base leading-tight mb-0.5">
              {memberFullName}
            </h3>
            <p className="text-white/55 text-xs">@{memberNick}</p>
          </div>
        </div>

        {/* ── Body ────────────────────────────────────────────────────── */}
        <div className="p-5">
          {/* Location */}
          {memberAddress && (
            <div className="flex items-center gap-1.5 mb-3">
              <HugeiconsIcon icon={Location01Icon} size={13} color="#9ca3af" strokeWidth={1.5} />
              <span className="text-xs line-clamp-1 text-[#9ca3af]">{memberAddress}</span>
            </div>
          )}

          {/* Description — reveals on card hover */}
          <div className="overflow-hidden transition-[max-height,opacity,margin-bottom] duration-300 ease-in-out max-h-0 opacity-0 mb-0 group-hover:max-h-14 group-hover:opacity-100 group-hover:mb-3.5">
            <p className="text-xs leading-relaxed line-clamp-3 text-[#6b7280]">
              {memberDesc ||
                "Experienced real estate professional ready to help you find your perfect property."}
            </p>
          </div>

          {/* Stats row */}
          <div className="flex items-center justify-between py-3 border-t border-b border-[#f3f4f6]">
            <div className="flex flex-col items-center gap-0.5 flex-1">
              <span className="text-sm font-extrabold text-[#222831]">{memberProperties}</span>
              <span className="text-[10px] font-medium text-[#9ca3af]">Listings</span>
            </div>
            <Separator orientation="vertical" className="h-7 bg-[#f3f4f6]" />
            <div className="flex flex-col items-center gap-0.5 flex-1">
              <span className="text-sm font-extrabold text-[#222831]">{memberLikes}</span>
              <span className="text-[10px] font-medium text-[#9ca3af]">Likes</span>
            </div>
            <Separator orientation="vertical" className="h-7 bg-[#f3f4f6]" />
            <div className="flex flex-col items-center gap-0.5 flex-1">
              <span className="text-sm font-extrabold text-[#222831]">{memberViews}</span>
              <span className="text-[10px] font-medium text-[#9ca3af]">Views</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 mt-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 rounded-xl border-[#ebebeb] hover:border-[#F25912] hover:bg-[#fff3ee] flex-shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    likeMemberHandler(user, agent._id);
                  }}
                >
                  <HugeiconsIcon icon={FavouriteIcon} size={16} color="#F25912" strokeWidth={1.5} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Like Agent</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 rounded-xl border-[#ebebeb] hover:border-[#222831] hover:bg-[#f9fafb] flex-shrink-0"
                  asChild
                >
                  <a href={`tel:${memberPhone}`} onClick={(e) => e.stopPropagation()}>
                    <HugeiconsIcon icon={CallIcon} size={16} color="#222831" strokeWidth={1.5} />
                  </a>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Call Agent</TooltipContent>
            </Tooltip>

            <Button
              className="flex-1 h-10 rounded-xl bg-[#222831] hover:bg-[#F25912] text-white text-sm font-bold gap-2 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                router.push({ pathname: "/agent/details", query: { agentId: agent._id } });
              }}
            >
              View Profile
              <HugeiconsIcon icon={ArrowRight01Icon} size={14} color="white" strokeWidth={2.5} />
            </Button>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default AgentCard;
