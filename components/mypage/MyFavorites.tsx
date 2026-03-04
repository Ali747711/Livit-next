// ─────────────────────────────────────────────────────────────────────────────
// MyFavorites.tsx
// ─────────────────────────────────────────────────────────────────────────────
import React, { useEffect, useState } from "react";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useMutation, useQuery, useReactiveVar } from "@apollo/client/react";
import { toast } from "sonner";
import { userVar } from "@/apollo/store";
import { LIKE_TARGET_PROPERTY } from "@/apollo/user/mutation";
import { GET_FAVORITES } from "@/apollo/user/query";
import { Messages } from "@/lib/config";
import { Property } from "@/lib/types/property/property";
import { HugeiconsIcon } from "@hugeicons/react";
import { FavouriteIcon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import PropertyCard from "../property/PropertyCard";

const SectionHeader = ({
  title,
  count,
  eyebrow,
}: {
  title: string;
  count?: number;
  eyebrow: string;
}) => (
  <div
    className="rounded-2xl overflow-hidden mb-5"
    style={{ background: "#fff", border: "1px solid #ebebeb" }}
  >
    <div
      style={{
        height: "3px",
        background: "linear-gradient(90deg, #F25912, #ff8c5a 40%, transparent)",
      }}
    />
    <div className="p-6">
      <div className="flex items-center gap-2 mb-1">
        <div
          className="h-[2px] w-4 rounded"
          style={{ background: "#F25912" }}
        />
        <span
          className="text-[11px] font-bold uppercase tracking-[0.16em]"
          style={{ color: "#F25912" }}
        >
          {eyebrow}
        </span>
      </div>
      <h1 className="text-xl font-extrabold" style={{ color: "#222831" }}>
        {title}{" "}
        {count !== undefined && (
          <span
            className="text-base font-semibold"
            style={{ color: "#9ca3af" }}
          >
            ({count})
          </span>
        )}
      </h1>
    </div>
  </div>
);

const EmptyState = ({
  icon,
  title,
  desc,
  action,
  onAction,
}: {
  icon: any;
  title: string;
  desc: string;
  action?: string;
  onAction?: () => void;
}) => (
  <div
    className="rounded-2xl flex flex-col items-center justify-center py-20"
    style={{ background: "#fff", border: "1px solid #ebebeb" }}
  >
    <div
      className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
      style={{ background: "#f3f4f6" }}
    >
      <HugeiconsIcon icon={icon} size={28} color="#d1d5db" strokeWidth={1} />
    </div>
    <p className="text-sm font-bold mb-1" style={{ color: "#374151" }}>
      {title}
    </p>
    <p className="text-xs mb-5" style={{ color: "#9ca3af" }}>
      {desc}
    </p>
    {action && onAction && (
      <button
        onClick={onAction}
        className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold text-white"
        style={{ background: "#F25912" }}
      >
        {action}
        <HugeiconsIcon
          icon={ArrowRight01Icon}
          size={14}
          color="white"
          strokeWidth={2.5}
        />
      </button>
    )}
  </div>
);

const Pagination = ({
  current,
  total,
  onChange,
}: {
  current: number;
  total: number;
  onChange: (p: number) => void;
}) => {
  if (total <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-1.5 mt-6">
      <button
        disabled={current === 1}
        onClick={() => onChange(current - 1)}
        className="px-3 py-2 rounded-lg text-sm font-semibold border disabled:opacity-40"
        style={{ borderColor: "#ebebeb", color: "#374151" }}
      >
        Prev
      </button>
      {Array.from({ length: total }, (_, i) => i + 1).map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className="w-9 h-9 rounded-lg text-sm font-bold transition-all"
          style={{
            background: current === p ? "#F25912" : "transparent",
            color: current === p ? "#fff" : "#374151",
            border: current === p ? "none" : "1px solid #ebebeb",
          }}
        >
          {p}
        </button>
      ))}
      <button
        disabled={current === total}
        onClick={() => onChange(current + 1)}
        className="px-3 py-2 rounded-lg text-sm font-semibold border disabled:opacity-40"
        style={{ borderColor: "#ebebeb", color: "#374151" }}
      >
        Next
      </button>
    </div>
  );
};

export const MyFavorites: NextPage = () => {
  const router = useRouter();
  const user = useReactiveVar(userVar);
  const [myFavorites, setMyFavorites] = useState<Property[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [search, setSearch] = useState({ page: 1, limit: 6 });

  const [likeTargetProperty] = useMutation(LIKE_TARGET_PROPERTY);
  const { loading, data, refetch } = useQuery<any>(GET_FAVORITES, {
    fetchPolicy: "network-only",
    variables: { input: search },
    notifyOnNetworkStatusChange: true,
  });

  useEffect(() => {
    if (data?.getFavorites) {
      setMyFavorites(data.getFavorites.list || []);
      setTotal(data.getFavorites.metaCounter?.[0]?.total ?? 0);
    }
  }, [data]);

  const likePropertyHandler = async (user: any, id: string) => {
    try {
      if (!id || !user._id) throw new Error(Messages.error2);
      await likeTargetProperty({ variables: { input: id } });
      await refetch({ input: search });
      toast.success("Removed from favorites");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const totalPages = Math.ceil(total / search.limit);

  return (
    <div>
      <SectionHeader
        title="My Favorites"
        count={total}
        eyebrow="Saved Properties"
      />
      {loading ? (
        <div className="grid md:grid-cols-2 gap-5">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-2xl animate-pulse"
              style={{ height: "300px", background: "#e5e7eb" }}
            />
          ))}
        </div>
      ) : myFavorites.length === 0 ? (
        <EmptyState
          icon={FavouriteIcon}
          title="No favorites yet"
          desc="Save properties you love by clicking the heart icon."
          action="Browse Properties"
          onAction={() => router.push("/property")}
        />
      ) : (
        <>
          <div className="grid md:grid-cols-2 gap-5">
            {myFavorites.map((p) => (
              <PropertyCard
                key={p._id}
                property={p}
                onLike={(id: any) => likePropertyHandler(user, id)}
                onClick={(id: any) => router.push(`/property/${id}`)}
              />
            ))}
          </div>
          <Pagination
            current={search.page}
            total={totalPages}
            onChange={(p) => setSearch({ ...search, page: p })}
          />
        </>
      )}
    </div>
  );
};

export default MyFavorites;
