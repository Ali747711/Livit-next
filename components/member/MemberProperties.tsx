import React, { useEffect, useState } from "react";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { GET_PROPERTIES } from "@/apollo/user/query";
import { Property } from "@/lib/types/property/property";
import { PropertiesInquiry } from "@/lib/types/property/property.input";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Home01Icon,
  GridViewIcon,
  ListViewIcon,
  EyeIcon,
  FavouriteIcon,
} from "@hugeicons/core-free-icons";
import { getImageUrl } from "@/lib/utils";
import { useQuery } from "@apollo/client/react";
import PropertyCard from "../property/PropertyCard";
import { SectionHeader, EmptyState, Spinner, Pagination } from "./shared";

const defaultInput = {
  page: 1,
  limit: 6,
  sort: "createdAt",
  direction: "DESC",
  search: { memberId: "" },
};

const MemberProperties: NextPage = ({ initialInput = defaultInput }: any) => {
  const router = useRouter();
  const { memberId } = router.query;

  const [searchFilter, setSearchFilter] = useState<PropertiesInquiry>({
    ...initialInput,
  });
  const [agentProperties, setAgentProperties] = useState<Property[]>([]);
  const [total, setTotal] = useState(0);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { loading, data, refetch } = useQuery<any>(GET_PROPERTIES, {
    fetchPolicy: "network-only",
    variables: { input: searchFilter },
    skip: !searchFilter?.search?.memberId,
    notifyOnNetworkStatusChange: true,
  });

  useEffect(() => {
    if (data?.getProperties) {
      setAgentProperties(data.getProperties.list || []);
      setTotal(data.getProperties.metaCounter?.[0]?.total ?? 0);
    }
  }, [data]);

  useEffect(() => {
    if (memberId)
      setSearchFilter({
        ...initialInput,
        search: { memberId: memberId as string },
      });
  }, [memberId]);

  useEffect(() => {
    if (searchFilter?.search?.memberId) refetch();
  }, [searchFilter]);

  const paginate = (page: number) => {
    setSearchFilter((p) => ({ ...p, page }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const sortHandler = (sort: string, direction: string) =>
    setSearchFilter((p) => ({
      ...p,
      sort,
      direction: direction as any,
      page: 1,
    }));

  const totalPages = Math.ceil(total / searchFilter.limit);

  return (
    <div className="space-y-4">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: "#fff", border: "1px solid #ebebeb" }}
      >
        <div
          style={{
            height: "3px",
            background:
              "linear-gradient(90deg, #F25912, #ff8c5a 40%, transparent)",
          }}
        />
        <div className="px-6 py-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div
                className="h-[2px] w-4 rounded"
                style={{ background: "#F25912" }}
              />
              <span
                className="text-[11px] font-bold uppercase tracking-[0.16em]"
                style={{ color: "#F25912" }}
              >
                Listings
              </span>
            </div>
            <div className="flex items-end gap-2">
              <h1
                className="text-xl font-extrabold"
                style={{ color: "#222831" }}
              >
                Properties
              </h1>
              <span
                className="text-sm font-bold mb-0.5 px-2.5 py-0.5 rounded-full"
                style={{ background: "#f3f4f6", color: "#6b7280" }}
              >
                {total} total
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Sort */}
            <select
              onChange={(e) => {
                const [s, d] = e.target.value.split("-");
                sortHandler(s, d);
              }}
              className="text-xs font-semibold px-3 py-2 rounded-xl focus:outline-none transition-all"
              style={{
                border: "1px solid #ebebeb",
                color: "#374151",
                background: "#f9fafb",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#F25912")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#ebebeb")}
            >
              <option value="createdAt-DESC">Newest First</option>
              <option value="createdAt-ASC">Oldest First</option>
              <option value="propertyPrice-DESC">Price: High → Low</option>
              <option value="propertyPrice-ASC">Price: Low → High</option>
              <option value="propertyViews-DESC">Most Viewed</option>
              <option value="propertyLikes-DESC">Most Liked</option>
            </select>

            {/* View toggle */}
            <div
              className="flex items-center gap-1 p-1 rounded-xl"
              style={{ background: "#f3f4f6" }}
            >
              {[
                { mode: "grid" as const, icon: GridViewIcon },
                { mode: "list" as const, icon: ListViewIcon },
              ].map(({ mode, icon }) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className="p-2 rounded-lg transition-all"
                  style={{
                    background: viewMode === mode ? "#222831" : "transparent",
                    color: viewMode === mode ? "#fff" : "#9ca3af",
                  }}
                >
                  <HugeiconsIcon
                    icon={icon}
                    size={16}
                    color="currentColor"
                    strokeWidth={1.5}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Content ────────────────────────────────────────────────── */}
      {loading && <Spinner />}

      {!loading && agentProperties.length === 0 && (
        <EmptyState
          icon={Home01Icon}
          message="No properties found"
          sub={
            memberId
              ? "This member hasn't listed any properties yet."
              : "Start listing properties to see them here."
          }
        />
      )}

      {!loading && agentProperties.length > 0 && (
        <>
          {viewMode === "grid" ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {agentProperties.map((property) => (
                <PropertyCard
                  key={property._id}
                  property={property}
                  onClick={() =>
                    router.push(`/property/details?id=${property._id}`)
                  }
                />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {agentProperties.map((property) => (
                <div
                  key={property._id}
                  className="rounded-2xl overflow-hidden cursor-pointer transition-all"
                  style={{ background: "#fff", border: "1px solid #ebebeb" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.borderColor = "#d1d5db")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.borderColor = "#ebebeb")
                  }
                  onClick={() =>
                    router.push(`/property/details?id=${property._id}`)
                  }
                >
                  <div className="flex flex-col sm:flex-row">
                    {/* Image */}
                    <div
                      className="sm:w-56 h-44 sm:h-auto flex-shrink-0 overflow-hidden"
                      style={{ background: "#f3f4f6" }}
                    >
                      {property.propertyImages?.[0] ? (
                        <img
                          src={getImageUrl(property.propertyImages[0])}
                          alt={property.propertyTitle}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <HugeiconsIcon
                            icon={Home01Icon}
                            size={36}
                            color="#d1d5db"
                            strokeWidth={1.5}
                          />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-5">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="min-w-0">
                          <h3
                            className="text-sm font-extrabold truncate mb-0.5"
                            style={{ color: "#222831" }}
                          >
                            {property.propertyTitle}
                          </h3>
                          <p
                            className="text-xs truncate"
                            style={{ color: "#9ca3af" }}
                          >
                            {property.propertyAddress}
                          </p>
                        </div>
                        <span
                          className="flex-shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide"
                          style={{ background: "#fff3ee", color: "#F25912" }}
                        >
                          {property.propertyType}
                        </span>
                      </div>

                      {/* Specs */}
                      <div
                        className="flex items-center gap-4 mb-3 text-xs"
                        style={{ color: "#9ca3af" }}
                      >
                        {property.propertyBeds && (
                          <span>{property.propertyBeds} beds</span>
                        )}
                        {property.propertyRooms && (
                          <span>{property.propertyRooms} rooms</span>
                        )}
                        {property.propertySquare && (
                          <span>{property.propertySquare}㎡</span>
                        )}
                      </div>

                      {/* Price + stats */}
                      <div className="flex items-center justify-between">
                        <span
                          className="text-base font-extrabold"
                          style={{ color: "#F25912" }}
                        >
                          ₩{property.propertyPrice?.toLocaleString()}
                        </span>
                        <div
                          className="flex items-center gap-3 text-xs"
                          style={{ color: "#9ca3af" }}
                        >
                          <span className="flex items-center gap-1">
                            <HugeiconsIcon
                              icon={EyeIcon}
                              size={13}
                              color="currentColor"
                              strokeWidth={1.5}
                            />
                            {property.propertyViews}
                          </span>
                          <span className="flex items-center gap-1">
                            <HugeiconsIcon
                              icon={FavouriteIcon}
                              size={13}
                              color="currentColor"
                              strokeWidth={1.5}
                            />
                            {property.propertyLikes}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <Pagination
            currentPage={searchFilter.page}
            totalPages={totalPages}
            total={total}
            limit={searchFilter.limit}
            label="properties"
            onPage={paginate}
          />
        </>
      )}
    </div>
  );
};

export default MemberProperties;
