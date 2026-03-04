import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useQuery, useReactiveVar } from "@apollo/client/react";
import { GET_MEMBER_FOLLOWER_2 } from "@/apollo/user/query";
import { Follower } from "@/lib/types/follow/follow";
import { FollowInquiry } from "@/lib/types/follow/follow.input";
import { userVar } from "@/apollo/store";
import { UserGroupIcon } from "@hugeicons/core-free-icons";
import {
  MemberRow,
  Pagination,
  SectionHeader,
  EmptyState,
  Spinner,
} from "./shared";

const defaultInput = { page: 1, limit: 6, search: { followingId: "" } };

const MemberFollowers = ({
  initialInput = defaultInput,
  subscribeHandler,
  unsubscribeHandler,
  likeMemberHandler,
  redirectToMemberPageHandler,
}: any) => {
  const router = useRouter();
  const user = useReactiveVar(userVar);
  const [followInquiry, setFollowInquiry] =
    useState<FollowInquiry>(initialInput);
  const [memberFollowers, setMemberFollowers] = useState<Follower[]>([]);
  const [total, setTotal] = useState(0);

  const { loading, data, refetch } = useQuery<any>(GET_MEMBER_FOLLOWER_2, {
    fetchPolicy: "network-only",
    variables: { input: followInquiry },
    skip: !followInquiry?.search?.followingId,
    notifyOnNetworkStatusChange: true,
  });

  useEffect(() => {
    if (data?.getMemberFollowers) {
      setMemberFollowers(data.getMemberFollowers.list || []);
      setTotal(data.getMemberFollowers.metaCounter?.[0]?.total ?? 0);
    }
  }, [data]);

  useEffect(() => {
    const id = (router.query.memberId as string) || user?._id;
    if (id) setFollowInquiry((p) => ({ ...p, search: { followingId: id } }));
  }, [router.query.memberId, user?._id]);

  useEffect(() => {
    if (followInquiry?.search?.followingId) refetch({ input: followInquiry });
  }, [followInquiry]);

  const paginate = (page: number) => {
    setFollowInquiry((p) => ({ ...p, page }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const totalPages = Math.ceil(total / followInquiry.limit);

  return (
    <div className="space-y-4">
      <SectionHeader eyebrow="Social" title="Followers" count={total} />

      {loading && <Spinner />}

      {!loading && memberFollowers.length === 0 && (
        <EmptyState
          icon={UserGroupIcon}
          message="No followers yet"
          sub="When people follow this member, they'll appear here."
        />
      )}

      {!loading && memberFollowers.length > 0 && (
        <>
          <div className="space-y-3">
            {memberFollowers.map((item) => {
              const d = item.followerData;
              if (!d) return null;
              return (
                <MemberRow
                  key={item._id}
                  id={d._id}
                  nick={d.memberNick}
                  fullName={d.memberFullName}
                  image={d.memberImage}
                  followers={d.memberFollowers || 0}
                  followings={d.memberFollowings || 0}
                  likes={d.memberLikes || 0}
                  isLiked={!!item.meLiked?.[0]?.myFavorite}
                  isFollowing={!!item.meFollowed?.[0]?.myFollowing}
                  isOwnProfile={user?._id === d._id}
                  onAvatarClick={() => redirectToMemberPageHandler(d._id)}
                  onLike={() => likeMemberHandler(d._id, refetch)}
                  onFollow={() => subscribeHandler(d._id, refetch)}
                  onUnfollow={() => unsubscribeHandler(d._id, refetch)}
                />
              );
            })}
          </div>

          <Pagination
            currentPage={followInquiry.page}
            totalPages={totalPages}
            total={total}
            limit={followInquiry.limit}
            label="followers"
            onPage={paginate}
          />
        </>
      )}
    </div>
  );
};

export default MemberFollowers;
