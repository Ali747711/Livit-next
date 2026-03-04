import { userVar } from "@/apollo/store";
import {
  LIKE_TARGET_MEMBER,
  SUBSCRIBE,
  UNSUBSCRIBE,
} from "@/apollo/user/mutation";
import { Messages } from "@/lib/config";
import { useMutation, useReactiveVar } from "@apollo/client/react";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { toast } from "sonner";
import MemberMenu from "@/components/member/MemberMenu";
import MemberProperties from "@/components/member/MemberProperties";
import MemberFollowers from "@/components/member/MemberFollowers";
import MemberFollowings from "@/components/member/MemberFollowings";

const MemberPage: NextPage = () => {
  const router = useRouter();
  const category = (router.query?.category as string) ?? "properties";
  const user = useReactiveVar(userVar);

  const [subscribe] = useMutation(SUBSCRIBE);
  const [unsubscribe] = useMutation(UNSUBSCRIBE);
  const [likeTargetMember] = useMutation(LIKE_TARGET_MEMBER);

  useEffect(() => {
    if (!router.isReady) return;
    if (!router.query.category) {
      router.replace(
        {
          pathname: router.pathname,
          query: { ...router.query, category: "properties" },
        },
        undefined,
        { shallow: true },
      );
    }
  }, [router.isReady, router.query.category]);

  const subscribeHandler = async (id: string, refetch: any) => {
    try {
      if (!id) throw new Error(Messages.error1);
      if (!user._id) {
        toast.error("Please login first");
        throw new Error(Messages.error2);
      }
      await subscribe({ variables: { input: id } });
      toast.success("Followed!");
      await refetch();
    } catch (err: any) {
      toast.error(err.message || "Failed to follow");
    }
  };

  const unsubscribeHandler = async (id: string, refetch: any) => {
    try {
      if (!id) throw new Error(Messages.error1);
      if (!user._id) {
        toast.error("Please login first");
        throw new Error(Messages.error2);
      }
      await unsubscribe({ variables: { input: id } });
      toast.success("Unfollowed!");
      await refetch();
    } catch (err: any) {
      toast.error(err.message || "Failed to unfollow");
    }
  };

  const likeMemberHandler = async (id: string, refetch: any) => {
    try {
      if (!id || !user._id) {
        toast.error("Please login first");
        return;
      }
      await likeTargetMember({ variables: { input: id } });
      toast.success("Success!");
      await refetch();
    } catch (err: any) {
      toast.error(err.message || "Failed");
    }
  };

  const redirectToMemberPageHandler = async (memberId: string) => {
    try {
      await router.push(
        memberId === user?._id
          ? `/mypage?memberId=${memberId}`
          : `/member?memberId=${memberId}`,
      );
    } catch {
      toast.error("Failed to navigate");
    }
  };

  return (
    <div className="min-h-screen" style={{ background: "#f7f7f5" }}>
      <div style={{ background: "#fff", borderBottom: "1px solid #ebebeb" }}>
        <div className="container mx-auto px-6 max-w-7xl py-6">
          <div className="flex items-center gap-2 mb-1">
            <div
              className="h-[2px] w-5 rounded"
              style={{ background: "#F25912" }}
            />
            <span
              className="text-[11px] font-bold uppercase tracking-[0.18em]"
              style={{ color: "#F25912" }}
            >
              Member Profile
            </span>
          </div>
          <h1 className="text-2xl font-extrabold" style={{ color: "#222831" }}>
            Profile
          </h1>
        </div>
      </div>

      <div className="container mx-auto px-6 max-w-7xl py-8">
        <div className="grid lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <MemberMenu
              subscribeHandler={subscribeHandler}
              unsubscribeHandler={unsubscribeHandler}
            />
          </div>
          <div className="lg:col-span-3">
            {category === "properties" && <MemberProperties />}
            {category === "followers" && (
              <MemberFollowers
                subscribeHandler={subscribeHandler}
                unsubscribeHandler={unsubscribeHandler}
                likeMemberHandler={likeMemberHandler}
                redirectToMemberPageHandler={redirectToMemberPageHandler}
              />
            )}
            {category === "followings" && (
              <MemberFollowings
                subscribeHandler={subscribeHandler}
                unsubscribeHandler={unsubscribeHandler}
                likeMemberHandler={likeMemberHandler}
                redirectToMemberPageHandler={redirectToMemberPageHandler}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberPage;
