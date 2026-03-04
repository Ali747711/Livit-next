import { NextPage } from "next";
import AdminLayout from "@/components/layouts/AdminLayout";
import { useQuery, useReactiveVar } from "@apollo/client/react";
import { userVar } from "@/apollo/store";
import {
  GET_ALL_MEMBERS_BY_ADMIN,
  GET_ALL_PROPERTIES_BY_ADMIN,
  GET_ALL_BOARD_ARTICLES_BY_ADMIN,
} from "@/apollo/admin/query";
import { Member } from "@/lib/types/member/member";
import { Property } from "@/lib/types/property/property";
import { MemberStatus, MemberType } from "@/lib/enums/member";
import { PropertyStatus } from "@/lib/enums/property";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  UserGroupIcon,
  Home01Icon,
  DocumentValidationIcon,
  MessageIcon,
  ArrowRight01Icon,
  EyeIcon,
  TrendingUp,
  UserIcon,
  AccountSetting03Icon,
} from "@hugeicons/core-free-icons";
import { useRouter } from "next/router";
import { getImageUrl } from "@/lib/utils";

const countInput = {
  page: 1,
  limit: 1,
  sort: "createdAt",
  direction: "DESC",
  search: {},
};
const recentInput = {
  page: 1,
  limit: 5,
  sort: "createdAt",
  direction: "DESC",
  search: {},
};

/* ── Badge configs ── */
const memberStatusCfg: Record<
  MemberStatus,
  { cls: string; dot: string; label: string }
> = {
  [MemberStatus.ACTIVE]: {
    cls: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    dot: "bg-emerald-500",
    label: "Active",
  },
  [MemberStatus.BLOCKED]: {
    cls: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    dot: "bg-amber-500",
    label: "Blocked",
  },
  [MemberStatus.DELETE]: {
    cls: "bg-red-50 text-red-600 ring-1 ring-red-200",
    dot: "bg-red-500",
    label: "Deleted",
  },
};
const memberTypeCfg: Record<MemberType, { cls: string }> = {
  [MemberType.USER]: { cls: "bg-blue-50 text-blue-700 ring-1 ring-blue-200" },
  [MemberType.AGENT]: {
    cls: "bg-violet-50 text-violet-700 ring-1 ring-violet-200",
  },
  [MemberType.ADMIN]: {
    cls: "bg-slate-100 text-slate-600 ring-1 ring-slate-200",
  },
};
const propertyStatusCfg: Record<PropertyStatus, { cls: string; dot: string }> =
  {
    [PropertyStatus.ACTIVE]: {
      cls: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
      dot: "bg-emerald-500",
    },
    [PropertyStatus.SOLD]: {
      cls: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
      dot: "bg-blue-500",
    },
    [PropertyStatus.DELETE]: {
      cls: "bg-red-50 text-red-600 ring-1 ring-red-200",
      dot: "bg-red-500",
    },
  };

interface BoardArticle {
  _id: string;
  articleCategory: string;
  articleStatus: string;
  articleTitle: string;
  articleViews: number;
  articleLikes: number;
  createdAt: Date;
  memberData?: { memberNick: string };
}

/* ══ Skeleton row ══ */
const SkeletonRow = () => (
  <li className="flex items-center gap-3 px-5 py-3.5 animate-pulse">
    <div className="w-9 h-9 rounded-xl bg-slate-100 shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="h-3 bg-slate-100 rounded-full w-3/5" />
      <div className="h-2.5 bg-slate-100 rounded-full w-2/5" />
    </div>
    <div className="h-5 w-14 bg-slate-100 rounded-full shrink-0" />
  </li>
);

/* ══ Stat Card ══ */
interface StatCardProps {
  label: string;
  value: string | number;
  icon: any;
  gradient: string;
  iconCls: string;
  href: string;
}
const StatCard = ({
  label,
  value,
  icon,
  gradient,
  iconCls,
  href,
}: StatCardProps) => {
  const router = useRouter();
  return (
    <button
      onClick={() => router.push(href)}
      className="group relative bg-white rounded-2xl border border-slate-200/80 shadow-xs
        hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 text-left w-full overflow-hidden"
    >
      <div className={`h-1 w-full bg-gradient-to-r ${gradient}`} />
      <div className="p-5">
        <div className="flex items-center justify-between mb-5">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconCls}`}
          >
            <HugeiconsIcon
              icon={icon}
              size={20}
              strokeWidth={1.8}
              color="currentColor"
            />
          </div>
          <span
            className="inline-flex items-center gap-1 text-[11px] font-semibold
            text-emerald-600 bg-emerald-50 ring-1 ring-emerald-100 px-2 py-1 rounded-full"
          >
            <HugeiconsIcon
              icon={TrendingUp}
              size={11}
              strokeWidth={2.5}
              color="currentColor"
            />
            +0%
          </span>
        </div>
        <p className="text-3xl font-extrabold text-slate-900 leading-none tracking-tight tabular-nums">
          {value}
        </p>
        <p className="text-[13px] text-slate-500 mt-1.5 font-medium">{label}</p>
      </div>
      <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center">
          <HugeiconsIcon
            icon={ArrowRight01Icon}
            size={13}
            strokeWidth={2.5}
            className="text-slate-500 group-hover:translate-x-0.5 transition-transform"
            color="currentColor"
          />
        </div>
      </div>
    </button>
  );
};

/* ══ Section card ══ */
const Section = ({
  title,
  href,
  loading,
  empty,
  children,
}: {
  title: string;
  href: string;
  loading: boolean;
  empty: boolean;
  children: React.ReactNode;
}) => {
  const router = useRouter();
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <h3 className="text-[13px] font-semibold text-slate-800">{title}</h3>
        <button
          onClick={() => router.push(href)}
          className="inline-flex items-center gap-1 text-xs font-semibold
            text-[#F25912] hover:text-[#D94E0F] transition-colors"
        >
          View all
          <HugeiconsIcon
            icon={ArrowRight01Icon}
            size={12}
            strokeWidth={2.5}
            color="currentColor"
          />
        </button>
      </div>
      <ul className="divide-y divide-slate-100 flex-1">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
        ) : empty ? (
          <li className="flex items-center justify-center py-14 text-sm text-slate-400">
            Nothing here yet
          </li>
        ) : (
          children
        )}
      </ul>
    </div>
  );
};

/* ══════════════════════════════════════════════════════ */
const AdminDashboard: NextPage = () => {
  const router = useRouter();
  const user = useReactiveVar(userVar);

  const { data: membersCount } = useQuery<any>(GET_ALL_MEMBERS_BY_ADMIN, {
    fetchPolicy: "network-only",
    variables: { input: countInput },
  });
  const { data: propertiesCount } = useQuery<any>(GET_ALL_PROPERTIES_BY_ADMIN, {
    fetchPolicy: "network-only",
    variables: { input: countInput },
  });
  const { data: articlesCount } = useQuery<any>(
    GET_ALL_BOARD_ARTICLES_BY_ADMIN,
    {
      fetchPolicy: "network-only",
      variables: { input: countInput },
    },
  );

  const { data: recentMembersData, loading: loadingMembers } = useQuery<any>(
    GET_ALL_MEMBERS_BY_ADMIN,
    { fetchPolicy: "network-only", variables: { input: recentInput } },
  );
  const { data: recentPropertiesData, loading: loadingProperties } =
    useQuery<any>(GET_ALL_PROPERTIES_BY_ADMIN, {
      fetchPolicy: "network-only",
      variables: { input: recentInput },
    });
  const { data: recentArticlesData, loading: loadingArticles } = useQuery<any>(
    GET_ALL_BOARD_ARTICLES_BY_ADMIN,
    { fetchPolicy: "network-only", variables: { input: recentInput } },
  );

  const totalUsers =
    membersCount?.getAllMembersByAdmin?.metaCounter[0]?.total ?? "0";
  const totalProperties =
    propertiesCount?.getAllPropertiesByAdmin?.metaCounter[0]?.total ?? "0";
  const totalArticles =
    articlesCount?.getAllBoardArticlesByAdmin?.metaCounter[0]?.total ?? "0";

  const recentMembers: Member[] =
    recentMembersData?.getAllMembersByAdmin?.list ?? [];
  const recentProperties: Property[] =
    recentPropertiesData?.getAllPropertiesByAdmin?.list ?? [];
  const recentArticles: BoardArticle[] =
    recentArticlesData?.getAllBoardArticlesByAdmin?.list ?? [];

  const statCards: StatCardProps[] = [
    {
      label: "Total Users",
      value: totalUsers,
      icon: UserGroupIcon,
      gradient: "from-[#F25912] to-[#D94E0F]",
      iconCls: "bg-[#FEF0E9] text-[#F25912]",
      href: "/admin/users",
    },
    {
      label: "Total Properties",
      value: totalProperties,
      icon: Home01Icon,
      gradient: "from-emerald-400 to-emerald-600",
      iconCls: "bg-emerald-50 text-emerald-600",
      href: "/admin/properties",
    },
    {
      label: "Total Articles",
      value: totalArticles,
      icon: DocumentValidationIcon,
      gradient: "from-violet-400 to-violet-600",
      iconCls: "bg-violet-50 text-violet-600",
      href: "/admin/articles",
    },
    {
      label: "Comments",
      value: "0",
      icon: MessageIcon,
      gradient: "from-amber-400 to-amber-600",
      iconCls: "bg-amber-50 text-amber-600",
      href: "/admin/comments",
    },
  ];

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const dateStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <AdminLayout title="Dashboard">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[22px] font-bold text-slate-900 tracking-tight leading-snug">
            <div className="flex flex-row gap-1.5">
              <HugeiconsIcon icon={AccountSetting03Icon} />
              {greeting}
              {user.memberNick ? `, ${user.memberNick}` : ""}{" "}
            </div>
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">{dateStr}</p>
        </div>
        <button
          onClick={() => router.push("/")}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#F25912] hover:bg-[#D94E0F]
            text-white text-sm font-semibold rounded-xl shadow-sm hover:shadow-md transition-all shrink-0"
        >
          <HugeiconsIcon
            icon={Home01Icon}
            size={16}
            strokeWidth={2}
            color="white"
          />
          Back Home
        </button>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {statCards.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* ── Recent activity ── */}
      <div className="grid xl:grid-cols-3 gap-5">
        {/* Recent Users */}
        <Section
          title="Recent Users"
          href="/admin/users"
          loading={loadingMembers}
          empty={recentMembers.length === 0}
        >
          {recentMembers.map((m: Member) => {
            const type = memberTypeCfg[m.memberType];
            const status = memberStatusCfg[m.memberStatus];
            const imageUrl = getImageUrl(m.memberImage);
            return (
              <li
                key={m._id}
                className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50/70 transition-colors"
              >
                {m.memberImage ? (
                  <img
                    src={imageUrl}
                    alt={m.memberNick}
                    className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-200 shrink-0"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-xl bg-slate-100 ring-1 ring-slate-200 flex items-center justify-center shrink-0">
                    <HugeiconsIcon
                      icon={UserIcon}
                      size={16}
                      strokeWidth={1.5}
                      color="currentColor"
                      className="text-slate-400"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-slate-800 truncate">
                    {m.memberNick}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {new Date(m.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span
                    className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full ${type.cls}`}
                  >
                    {m.memberType}
                  </span>
                </div>
              </li>
            );
          })}
        </Section>

        {/* Recent Properties */}
        <Section
          title="Recent Properties"
          href="/admin/properties"
          loading={loadingProperties}
          empty={recentProperties.length === 0}
        >
          {recentProperties.map((p: Property) => {
            const ps = propertyStatusCfg[p.propertyStatus];
            const imageUrl = getImageUrl(p.propertyImages[0]);
            return (
              <li
                key={p._id}
                className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50/70 transition-colors"
              >
                {p.propertyImages?.[0] ? (
                  <img
                    src={imageUrl}
                    alt={p.propertyTitle}
                    className="w-12 h-9 rounded-xl object-cover ring-1 ring-slate-200 shrink-0"
                  />
                ) : (
                  <div className="w-12 h-9 rounded-xl bg-slate-100 ring-1 ring-slate-200 flex items-center justify-center shrink-0">
                    <HugeiconsIcon
                      icon={Home01Icon}
                      size={16}
                      strokeWidth={1.5}
                      color="currentColor"
                      className="text-slate-400"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-slate-800 truncate">
                    {p.propertyTitle}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    ₩{p.propertyPrice.toLocaleString()}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${ps.cls}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${ps.dot}`} />
                  {p.propertyStatus}
                </span>
              </li>
            );
          })}
        </Section>

        {/* Recent Articles */}
        <Section
          title="Recent Articles"
          href="/admin/articles"
          loading={loadingArticles}
          empty={recentArticles.length === 0}
        >
          {recentArticles.map((a: BoardArticle) => (
            <li
              key={a._id}
              className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50/70 transition-colors"
            >
              <div className="w-9 h-9 rounded-xl bg-violet-50 ring-1 ring-violet-200 flex items-center justify-center shrink-0">
                <HugeiconsIcon
                  icon={DocumentValidationIcon}
                  size={16}
                  strokeWidth={1.5}
                  color="#7c3aed"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-slate-800 truncate">
                  {a.articleTitle}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {a.memberData?.memberNick ?? "—"} ·{" "}
                  {new Date(a.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 shrink-0">
                <HugeiconsIcon
                  icon={EyeIcon}
                  size={12}
                  strokeWidth={1.5}
                  color="currentColor"
                />
                {a.articleViews}
              </span>
            </li>
          ))}
        </Section>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
