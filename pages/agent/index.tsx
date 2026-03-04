import { LIKE_TARGET_MEMBER } from "@/apollo/user/mutation";
import { GET_AGENTS } from "@/apollo/user/query";
import { Messages } from "@/lib/config";
import { Member } from "@/lib/types/member/member";
import { useMutation, useQuery } from "@apollo/client/react";
import { NextPage } from "next";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Search01Icon, ArrowRight01Icon, UserGroupIcon } from "@hugeicons/core-free-icons";
import AgentCard from "@/components/agent/AgentCard";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface GetAgentsResponse {
  getAgents: {
    list: Member[];
    metaCounter: Array<{ total: number }>;
  };
}

const defaultInput = {
  page: 1,
  limit: 9,
  sort: "createdAt",
  direction: "DESC",
  search: {},
};

const sortOptions = [
  { sort: "createdAt", direction: "DESC", label: "Most Recent" },
  { sort: "memberRank", direction: "DESC", label: "Top Ranked" },
  { sort: "memberProperties", direction: "DESC", label: "Most Listings" },
  { sort: "memberLikes", direction: "DESC", label: "Most Liked" },
  { sort: "memberViews", direction: "DESC", label: "Most Viewed" },
];

const AgentPage: NextPage = ({
  initialInput = defaultInput,
  ...props
}: any) => {
  const router = useRouter();
  const [filterSortName, setFilterSortName] = useState("Most Recent");
  const [searchFilter, setSearchFilter] = useState(
    router.query?.input
      ? JSON.parse(router.query?.input as string)
      : initialInput,
  );
  const [agents, setAgents] = useState<Member[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchText, setSearchText] = useState<string>("");

  const [likeTargetMember] = useMutation(LIKE_TARGET_MEMBER);
  const {
    loading,
    data,
    refetch: getAgentsRefetch,
  } = useQuery<GetAgentsResponse>(GET_AGENTS, {
    fetchPolicy: "network-only",
    variables: { input: searchFilter },
    notifyOnNetworkStatusChange: true,
  });

  useEffect(() => {
    if (data) {
      setAgents(data?.getAgents?.list);
      setTotal(data?.getAgents?.metaCounter[0]?.total ?? 0);
    }
  }, [data]);

  useEffect(() => {
    if (router.query?.input) {
      setSearchFilter(JSON.parse(router.query?.input as string));
    } else {
      router.replace(`/agent?input=${JSON.stringify(searchFilter)}`);
    }
    setCurrentPage(searchFilter.page ?? 1);
  }, [router.query?.input]);

  const likeMemberHandler = async (user: any, id: string) => {
    try {
      if (!id) return;
      if (!user._id) {
        toast.error("Please login first");
        throw new Error(Messages.error2);
      }
      await likeTargetMember({ variables: { input: id } });
      await getAgentsRefetch({ input: searchFilter });
    } catch (err: any) {
      console.log("AgentPage [likeMemberHandler]:", err.message);
    }
  };

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    const newFilter = {
      ...searchFilter,
      page: 1,
      search: searchText ? { text: searchText } : {},
    };
    router.push(`/agent?input=${JSON.stringify(newFilter)}`);
  };

  const handleSortChange = (sort: string, direction: string, label: string) => {
    const newFilter = { ...searchFilter, page: 1, sort, direction };
    setFilterSortName(label);
    router.push(`/agent?input=${JSON.stringify(newFilter)}`);
  };

  const handleLoadMore = () => {
    const newFilter = { ...searchFilter, page: currentPage + 1 };
    router.push(`/agent?input=${JSON.stringify(newFilter)}`);
  };

  const totalPages = Math.ceil(total / searchFilter.limit);

  return (
    <div className="min-h-screen bg-[#f7f7f5]">
      {/* ── Page header ─────────────────────────────────────────────── */}
      <section className="container mx-auto px-6 max-w-7xl pt-12 pb-8">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-0.5 w-5 rounded bg-[#F25912]" />
          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#F25912]">
            Our Professionals
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold leading-tight text-[#222831]">
              Meet Our Expert Agents
            </h1>
            {total > 0 && (
              <p className="mt-2 text-sm text-[#9ca3af]">
                {total} experienced professionals across South Korea
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Thin rule */}
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="h-px bg-[#ebebeb]" />
      </div>

      {/* ── Search + filter ──────────────────────────────────────────── */}
      <section className="container mx-auto px-6 max-w-7xl py-6">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Text search */}
          <form onSubmit={handleSearch} className="relative flex-1">
            <HugeiconsIcon
              icon={Search01Icon}
              size={17}
              color="#9ca3af"
              strokeWidth={1.5}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10"
            />
            <Input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search agents by name or nickname…"
              className="pl-10 h-11 rounded-xl border-[#ebebeb] bg-white text-[#374151] text-sm font-medium focus-visible:ring-[#F25912] focus-visible:ring-1 focus-visible:border-[#F25912]"
            />
          </form>

          {/* Sort dropdown — shadcn Select */}
          <Select
            value={filterSortName}
            onValueChange={(label) => {
              const option = sortOptions.find((o) => o.label === label);
              if (option) handleSortChange(option.sort, option.direction, option.label);
            }}
          >
            <SelectTrigger className="shrink-0 w-full sm:w-45 h-11 rounded-xl border-[#ebebeb] bg-white text-sm font-semibold text-[#374151] focus:ring-[#F25912] focus:ring-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-[#ebebeb] shadow-[0_12px_40px_rgba(0,0,0,0.09)]">
              {sortOptions.map((option) => (
                <SelectItem
                  key={option.label}
                  value={option.label}
                  className="text-sm font-medium cursor-pointer focus:text-[#F25912] focus:bg-[#fff3ee]"
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Search button */}
          <Button
            onClick={() => handleSearch()}
            className="shrink-0 h-11 px-6 rounded-xl bg-[#F25912] hover:bg-[#D94E0F] text-white text-sm font-bold gap-2 shadow-[0_4px_14px_rgba(242,89,18,0.28)]"
          >
            <HugeiconsIcon icon={Search01Icon} size={15} color="white" strokeWidth={2} />
            Search
          </Button>
        </div>

        {/* Result count */}
        {total > 0 && (
          <div className="mt-4">
            <Badge
              variant="secondary"
              className="text-xs font-medium text-[#6b7280] bg-[#f3f4f6]"
            >
              Showing {agents.length} of {total} agents
            </Badge>
          </div>
        )}
      </section>

      {/* ── Agents Grid ──────────────────────────────────────────────── */}
      <section className="container mx-auto px-6 max-w-7xl pb-20">
        {loading && agents.length === 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="rounded-2xl overflow-hidden bg-white border border-[#ebebeb]">
                <Skeleton className="h-60 w-full rounded-none" />
                <div className="p-5 space-y-3">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <div className="flex gap-4 py-3 border-t border-b border-[#f3f4f6]">
                    <Skeleton className="h-8 flex-1" />
                    <Skeleton className="h-8 flex-1" />
                    <Skeleton className="h-8 flex-1" />
                  </div>
                  <div className="flex gap-2 pt-1">
                    <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
                    <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
                    <Skeleton className="h-10 flex-1 rounded-xl" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : agents.length > 0 ? (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {agents.map((agent) => (
                <AgentCard
                  key={agent._id}
                  agent={agent}
                  likeMemberHandler={likeMemberHandler}
                />
              ))}
            </div>

            {currentPage < totalPages && (
              <div className="flex justify-center mt-12">
                <Button
                  variant="outline"
                  onClick={handleLoadMore}
                  disabled={loading}
                  className="px-8 rounded-full border-[#222831] text-[#222831] hover:bg-[#222831] hover:text-white font-bold gap-2 disabled:opacity-50 transition-colors"
                >
                  {loading ? (
                    <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <HugeiconsIcon
                      icon={ArrowRight01Icon}
                      size={14}
                      color="currentColor"
                      strokeWidth={2.5}
                    />
                  )}
                  {loading ? "Loading…" : "Load More Agents"}
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl py-24 bg-white border border-[#ebebeb]">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5 bg-[#f3f4f6]">
              <HugeiconsIcon
                icon={UserGroupIcon}
                size={32}
                color="#d1d5db"
                strokeWidth={1}
              />
            </div>
            <h3 className="text-base font-extrabold mb-1.5 text-[#222831]">No agents found</h3>
            <p className="text-sm text-[#9ca3af]">Try adjusting your search or filters</p>
            <Button
              variant="outline"
              className="mt-6 rounded-full border-[#ebebeb] text-[#374151] hover:border-[#F25912] hover:text-[#F25912] font-semibold"
              onClick={() => {
                setSearchText("");
                router.push(`/agent?input=${JSON.stringify(defaultInput)}`);
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </section>
    </div>
  );
};

export default AgentPage;
