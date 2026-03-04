import { useEffect } from "react";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useMutation, useReactiveVar } from "@apollo/client/react";
import { toast } from "sonner";
import { userVar } from "@/apollo/store";
import {
  LIKE_TARGET_MEMBER,
  SUBSCRIBE,
  UNSUBSCRIBE,
} from "@/apollo/user/mutation";
import { Messages } from "@/lib/config";
import MyMenu from "@/components/mypage/MyMenu";
import MyProfile from "@/components/mypage/MyProfile";
import CreateProperty from "@/components/mypage/AddNewProperty";
import MyProperties from "@/components/mypage/MyProperties";
import MyFavorites from "@/components/mypage/MyFavorites";
import RecentlyVisited from "@/components/mypage/RecentlyVisited";
import MemberFollowers from "@/components/member/MemberFollowers";
import MemberFollowings from "@/components/member/MemberFollowings";
import MyArticles from "@/components/mypage/MyArticles";
import WriteArticle from "@/components/mypage/WriteArticle";
import MyMessages from "@/components/mypage/MyMessages";

const MyPage: NextPage = () => {
  const router = useRouter();
  const user = useReactiveVar(userVar);
  const category = (router.query?.category as string) ?? "myProfile";

  const [subscribe] = useMutation(SUBSCRIBE);
  const [unsubscribe] = useMutation(UNSUBSCRIBE);
  const [likeTargetMember] = useMutation(LIKE_TARGET_MEMBER);

  useEffect(() => {
    if (!user?._id) {
      toast.error("Please login to access your profile");
      router.push("/");
    }
  }, [user]);

  useEffect(() => {
    if (!router.query.category) {
      router.replace(
        { pathname: "/mypage", query: { category: "myProfile" } },
        undefined,
        { shallow: true },
      );
    }
  }, [router.query.category]);

  const subscribeHandler = async (id: string, refetch: any, query: any) => {
    try {
      if (!id) throw new Error(Messages.error1);
      if (!user._id) {
        toast.error("Please login first");
        throw new Error(Messages.error2);
      }
      await subscribe({ variables: { input: id } });
      toast.success("Followed!");
      await refetch({ input: query });
    } catch (err: any) {
      toast.error(err.message || "Failed to follow");
    }
  };

  const unsubscribeHandler = async (id: string, refetch: any, query: any) => {
    try {
      if (!id) throw new Error(Messages.error1);
      if (!user._id) {
        toast.error("Please login first");
        throw new Error(Messages.error2);
      }
      await unsubscribe({ variables: { input: id } });
      toast.success("Unfollowed!");
      await refetch({ input: query });
    } catch (err: any) {
      toast.error(err.message || "Failed to unfollow");
    }
  };

  const likeMemberHandler = async (id: string, refetch: any, query: any) => {
    try {
      if (!id) return;
      if (!user._id) {
        toast.error("Please login first");
        throw new Error(Messages.error2);
      }
      await likeTargetMember({ variables: { input: id } });
      toast.success("Success!");
      await refetch({ input: query });
    } catch (err: any) {
      toast.error(err.message || "Failed to like");
    }
  };

  const redirectToMemberPageHandler = async (memberId: string) => {
    try {
      if (memberId === user?._id)
        await router.push(`/mypage?memberId=${memberId}`);
      else await router.push(`/member?memberId=${memberId}`);
    } catch (error: any) {
      toast.error("Failed to navigate");
    }
  };

  if (!user?._id) return null;

  return (
    <div className="min-h-screen" style={{ background: "#f7f7f5" }}>
      {/* ── Page header ───────────────────────────────────────────── */}
      <div className="container mx-auto px-6 max-w-7xl pt-8 pb-6">
        <div className="flex items-center gap-2 mb-1">
          <div
            className="h-[2px] w-5 rounded"
            style={{ background: "#F25912" }}
          />
          <span
            className="text-[11px] font-bold uppercase tracking-[0.18em]"
            style={{ color: "#F25912" }}
          >
            My Account
          </span>
        </div>
        <h1 className="text-2xl font-extrabold" style={{ color: "#222831" }}>
          Dashboard
        </h1>
      </div>

      {/* Thin rule */}
      <div className="container mx-auto px-6 max-w-7xl">
        <div style={{ height: "1px", background: "#ebebeb" }} />
      </div>

      {/* ── Layout ────────────────────────────────────────────────── */}
      <div className="container mx-auto px-6 max-w-7xl py-8">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <MyMenu />
          </div>

          {/* Main content */}
          <div className="lg:col-span-3">
            {category === "myProfile" && <MyProfile />}
            {category === "addProperty" && <CreateProperty />}
            {category === "editProperty" && <CreateProperty />}
            {category === "myProperties" && <MyProperties />}
            {category === "myFavorites" && <MyFavorites />}
            {category === "recentlyVisited" && <RecentlyVisited />}
            {category === "followers" && (
              <MemberFollowers
                initialInput={{
                  page: 1,
                  limit: 6,
                  search: { followingId: user._id },
                }}
                subscribeHandler={subscribeHandler}
                unsubscribeHandler={unsubscribeHandler}
                likeMemberHandler={likeMemberHandler}
                redirectToMemberPageHandler={redirectToMemberPageHandler}
              />
            )}
            {category === "followings" && (
              <MemberFollowings
                initialInput={{
                  page: 1,
                  limit: 6,
                  search: { followerId: user._id },
                }}
                subscribeHandler={subscribeHandler}
                unsubscribeHandler={unsubscribeHandler}
                likeMemberHandler={likeMemberHandler}
                redirectToMemberPageHandler={redirectToMemberPageHandler}
              />
            )}
            {category === "myMessages" && <MyMessages />}
            {category === "myArticles" && <MyArticles />}
            {category === "writeArticle" && <WriteArticle />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyPage;
