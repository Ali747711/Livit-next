import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { GET_MEMBER_FOLLOWINGS } from "@/apollo/user/query";
import { Following } from "@/lib/types/follow/follow";
import { FollowInquiry } from "@/lib/types/follow/follow.input";
import { userVar } from "@/apollo/store";
import { useQuery, useReactiveVar } from "@apollo/client/react";
import { UserGroupIcon } from "@hugeicons/core-free-icons";
import {
  MemberRow,
  Pagination,
  SectionHeader,
  EmptyState,
  Spinner,
} from "./shared";

const defaultInput = { page: 1, limit: 6, search: { followerId: "" } };

const MemberFollowings = ({
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
  const [memberFollowings, setMemberFollowings] = useState<Following[]>([]);
  const [total, setTotal] = useState(0);

  const { loading, data, refetch } = useQuery<any>(GET_MEMBER_FOLLOWINGS, {
    fetchPolicy: "network-only",
    variables: { input: followInquiry },
    skip: !followInquiry?.search?.followerId,
    notifyOnNetworkStatusChange: true,
  });

  useEffect(() => {
    if (data?.getMemberFollowings) {
      setMemberFollowings(data.getMemberFollowings.list || []);
      setTotal(data.getMemberFollowings.metaCounter?.[0]?.total ?? 0);
    }
  }, [data]);

  useEffect(() => {
    const id = (router.query.memberId as string) || user?._id;
    if (id) setFollowInquiry((p) => ({ ...p, search: { followerId: id } }));
  }, [router.query.memberId, user?._id]);

  useEffect(() => {
    if (followInquiry?.search?.followerId) refetch({ input: followInquiry });
  }, [followInquiry]);

  const paginate = (page: number) => {
    setFollowInquiry((p) => ({ ...p, page }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const totalPages = Math.ceil(total / followInquiry.limit);

  return (
    <div className="space-y-4">
      <SectionHeader eyebrow="Social" title="Following" count={total} />

      {loading && <Spinner />}

      {!loading && memberFollowings.length === 0 && (
        <EmptyState
          icon={UserGroupIcon}
          message="No followings yet"
          sub="Start following people to see them here."
        />
      )}

      {!loading && memberFollowings.length > 0 && (
        <>
          <div className="space-y-3">
            {memberFollowings.map((item) => {
              const d = item.followingData;
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
            label="followings"
            onPage={paginate}
          />
        </>
      )}
    </div>
  );
};

export default MemberFollowings;
