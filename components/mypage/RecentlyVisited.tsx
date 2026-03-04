import React, { useEffect, useState } from "react";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useQuery } from "@apollo/client/react";
import { GET_VISITED } from "@/apollo/user/query";
import { Property } from "@/lib/types/property/property";
import { HugeiconsIcon } from "@hugeicons/react";
import { Search01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import PropertyCard from "../property/PropertyCard";

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
          className="w-9 h-9 rounded-lg text-sm font-bold"
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

const RecentlyVisited: NextPage = () => {
  const router = useRouter();
  const [recentlyVisited, setRecentlyVisited] = useState<Property[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [search, setSearch] = useState({ page: 1, limit: 6 });

  const { loading, data } = useQuery<any>(GET_VISITED, {
    fetchPolicy: "network-only",
    variables: { input: search },
  });

  useEffect(() => {
    if (data?.getVisited) {
      setRecentlyVisited(data.getVisited.list || []);
      setTotal(data.getVisited.metaCounter?.[0]?.total ?? 0);
    }
  }, [data]);

  const totalPages = Math.ceil(total / search.limit);

  return (
    <div>
      {/* Header card */}
      <div
        className="rounded-2xl overflow-hidden mb-5"
        style={{ background: "#fff", border: "1px solid #ebebeb" }}
      >
        <div
          style={{
            height: "3px",
            background:
              "linear-gradient(90deg, #F25912, #ff8c5a 40%, transparent)",
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
              History
            </span>
          </div>
          <h1 className="text-xl font-extrabold" style={{ color: "#222831" }}>
            Recently Visited{" "}
            <span
              className="text-base font-semibold"
              style={{ color: "#9ca3af" }}
            >
              ({total})
            </span>
          </h1>
        </div>
      </div>

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
      ) : recentlyVisited.length === 0 ? (
        <div
          className="rounded-2xl flex flex-col items-center justify-center py-20"
          style={{ background: "#fff", border: "1px solid #ebebeb" }}
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: "#f3f4f6" }}
          >
            <HugeiconsIcon
              icon={Search01Icon}
              size={28}
              color="#d1d5db"
              strokeWidth={1}
            />
          </div>
          <p className="text-sm font-bold mb-1" style={{ color: "#374151" }}>
            No recently visited properties
          </p>
          <p className="text-xs mb-5" style={{ color: "#9ca3af" }}>
            Explore properties and they'll appear here for easy access.
          </p>
          <button
            onClick={() => router.push("/property")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold text-white"
            style={{ background: "#F25912" }}
          >
            Browse Properties
            <HugeiconsIcon
              icon={ArrowRight01Icon}
              size={14}
              color="white"
              strokeWidth={2.5}
            />
          </button>
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-2 gap-5">
            {recentlyVisited.map((p) => (
              <PropertyCard
                key={p._id}
                property={p}
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

export default RecentlyVisited;
