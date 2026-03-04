import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import { useRouter } from "next/router";
import { GET_PROPERTIES } from "@/apollo/user/query";
import { LIKE_TARGET_PROPERTY } from "@/apollo/user/mutation";
import { Property } from "@/lib/types/property/property";
import { toast } from "sonner";
import { getImageUrl } from "@/lib/utils";

const defaultInput = {
  page: 1,
  limit: 5,
  sort: "propertyViews",
  direction: "DESC",
  search: {},
};

const PopularProperties = ({ initialInput = defaultInput }: any) => {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [hoveredIdx, setHoveredIdx] = useState<number>(2);

  const [likeTargetProperty] = useMutation(LIKE_TARGET_PROPERTY);
  const { loading, data, refetch } = useQuery<any>(GET_PROPERTIES, {
    fetchPolicy: "cache-and-network",
    variables: { input: initialInput },
    notifyOnNetworkStatusChange: true,
  });

  useEffect(() => {
    if (data?.getProperties) setProperties(data.getProperties.list || []);
  }, [data]);

  const likePropertyHandler = async (
    e: React.MouseEvent,
    user: any,
    id: string,
  ) => {
    e.stopPropagation();
    try {
      if (!user?._id) {
        toast.error("Please login to like properties");
        return;
      }
      await likeTargetProperty({ variables: { input: id } });
      await refetch({ input: initialInput });
      toast.success("Property liked!");
    } catch (err: any) {
      toast.error(err.message || "Failed");
    }
  };

  if (loading && properties.length === 0) {
    return (
      <>
        {/* Mobile skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-2xl overflow-hidden animate-pulse bg-gray-200">
              <div className="aspect-4/3 bg-gray-300" />
              <div className="p-5 space-y-3">
                <div className="h-4 bg-gray-300 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
                <div className="h-px bg-gray-200 my-2" />
                <div className="flex gap-4">
                  <div className="h-3 bg-gray-200 rounded w-16" />
                  <div className="h-3 bg-gray-200 rounded w-16" />
                  <div className="h-3 bg-gray-200 rounded w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Desktop skeleton */}
        <div className="hidden md:flex gap-2" style={{ height: "500px" }}>
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="rounded-2xl animate-pulse flex-1"
              style={{ background: "#e5e7eb" }}
            />
          ))}
        </div>
      </>
    );
  }

  if (!loading && properties.length === 0) {
    return (
      <div
        className="rounded-2xl flex items-center justify-center"
        style={{
          height: "300px",
          background: "#f3f4f6",
          border: "1px solid #ebebeb",
        }}
      >
        <p style={{ color: "#9ca3af" }}>No popular properties found</p>
      </div>
    );
  }

  return (
    <>
      {/* ── Mobile: standard card grid (< md) ─────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden">
        {properties.map((property, idx) => {
          const imageUrl = property.propertyImages?.[0]
            ? getImageUrl(property.propertyImages[0])
            : "/img/banner/about1.jpg";

          return (
            <article
              key={property._id}
              onClick={() => router.push(`/property/details?id=${property._id}`)}
              className="group rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
            >
              {/* Image */}
              <div className="relative aspect-4/3 overflow-hidden">
                <img
                  src={imageUrl}
                  alt={property.propertyTitle}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent" />

                {/* Type badge top-left */}
                {property.propertyType && (
                  <span className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
                    {property.propertyType}
                  </span>
                )}

                {/* Rank badge top-right */}
                <span
                  className="absolute top-3 right-3 text-[10px] font-extrabold px-2.5 py-1 rounded-full"
                  style={{ background: "#F25912", color: "#fff", letterSpacing: "0.1em" }}
                >
                  #{String(idx + 1).padStart(2, "0")}
                </span>

                {/* Price overlay bottom-right */}
                <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-sm text-white rounded-xl px-3 py-1.5">
                  <span className="text-sm font-extrabold">
                    ₩{(property.propertyPrice / 1_000_000).toFixed(0)}M
                  </span>
                </div>
              </div>

              {/* Card body */}
              <div className="p-5">
                <h3 className="font-extrabold text-[#222831] text-base leading-snug mb-1 line-clamp-1">
                  {property.propertyTitle}
                </h3>

                {property.propertyAddress && (
                  <p className="text-gray-500 text-xs mb-3 flex items-center gap-1 truncate">
                    <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="shrink-0">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                      <circle cx="12" cy="9" r="2.5" />
                    </svg>
                    {property.propertyAddress}
                  </p>
                )}

                {/* Stats row */}
                <div className="flex items-center gap-3 text-xs text-gray-500 pt-3 border-t border-gray-100 flex-wrap">
                  {property.propertyBeds && (
                    <span className="flex items-center gap-1">
                      <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M2 9V19h20V9M2 19V7a2 2 0 012-2h16a2 2 0 012 2v2" />
                        <path d="M13 7H7a2 2 0 00-2 2v3h14V9a2 2 0 00-2-2h-4z" />
                      </svg>
                      {property.propertyBeds} Beds
                    </span>
                  )}
                  {property.propertyRooms && (
                    <span className="flex items-center gap-1">
                      <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <path d="M3 9h18M9 21V9" />
                      </svg>
                      {property.propertyRooms} Rooms
                    </span>
                  )}
                  {property.propertySquare && (
                    <span>{property.propertySquare} ㎡</span>
                  )}
                </div>

                {/* Price + CTA row */}
                <div className="flex items-center justify-between mt-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">Price</p>
                    <p className="text-lg font-extrabold" style={{ color: "#222831" }}>
                      ₩{(property.propertyPrice / 1_000_000).toFixed(0)}M
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/property/details?id=${property._id}`);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-white transition-colors"
                    style={{ background: "#F25912" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#D94E0F")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "#F25912")}
                  >
                    View
                    <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* ── Desktop: horizontal accordion (≥ md) — unchanged ─────────── */}
      <div
        className="hidden md:flex gap-2"
        style={{ height: "500px" }}
        onMouseLeave={() => setHoveredIdx(2)}
      >
        {properties.map((property, idx) => {
          const isExpanded = hoveredIdx === idx;
          const imageUrl = property.propertyImages?.[0]
            ? getImageUrl(property.propertyImages[0])
            : "/img/banner/about1.jpg";

          return (
            <div
              key={property._id}
              onMouseEnter={() => setHoveredIdx(idx)}
              onClick={() => router.push(`/property/details?id=${property._id}`)}
              className="relative rounded-2xl overflow-hidden cursor-pointer"
              style={{
                flex: isExpanded ? "2.8" : "0.65",
                transition: "flex 0.55s cubic-bezier(0.4, 0, 0.2, 1)",
                minWidth: "52px",
              }}
            >
              {/* Photo */}
              <img
                src={imageUrl}
                alt={property.propertyTitle}
                className="absolute inset-0 w-full h-full object-cover"
                style={{
                  transform: isExpanded ? "scale(1.06)" : "scale(1.01)",
                  transition: "transform 0.65s cubic-bezier(0.4, 0, 0.2, 1)",
                  filter: isExpanded
                    ? "brightness(1)"
                    : "brightness(0.5) saturate(0.7)",
                }}
              />

              {/* Gradient overlay */}
              <div
                className="absolute inset-0"
                style={{
                  background: isExpanded
                    ? "linear-gradient(to top, rgba(10,10,10,0.94) 0%, rgba(0,0,0,0.35) 52%, rgba(0,0,0,0.05) 100%)"
                    : "linear-gradient(to top, rgba(10,10,10,0.65) 0%, transparent 55%)",
                  transition: "background 0.4s ease",
                }}
              />

              {/* ── Collapsed: vertical index + title ─────────────────── */}
              <div
                className="absolute inset-0 flex flex-col items-center justify-end pb-6 gap-3"
                style={{
                  opacity: isExpanded ? 0 : 1,
                  transition: "opacity 0.2s ease",
                  pointerEvents: "none",
                }}
              >
                <span
                  className="text-[10px] font-extrabold"
                  style={{ color: "#F25912", letterSpacing: "0.15em" }}
                >
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <span
                  className="text-white text-[11px] font-bold"
                  style={{
                    writingMode: "vertical-rl",
                    textOrientation: "mixed",
                    transform: "rotate(180deg)",
                    maxHeight: "130px",
                    overflow: "hidden",
                    opacity: 0.8,
                    letterSpacing: "0.04em",
                  }}
                >
                  {property.propertyTitle}
                </span>
              </div>

              {/* ── Expanded: index badge top-left ─────────────────────── */}
              <div
                className="absolute top-5 left-5"
                style={{
                  opacity: isExpanded ? 1 : 0,
                  transition: "opacity 0.25s ease 0.1s",
                }}
              >
                <span
                  className="text-[11px] font-extrabold px-2.5 py-1 rounded-full"
                  style={{
                    background: "#F25912",
                    color: "#fff",
                    letterSpacing: "0.1em",
                  }}
                >
                  #{String(idx + 1).padStart(2, "0")}
                </span>
              </div>

              {/* ── Expanded: bottom content ──────────────────────────── */}
              <div
                className="absolute bottom-0 left-0 right-0 p-6"
                style={{
                  opacity: isExpanded ? 1 : 0,
                  transform: isExpanded ? "translateY(0)" : "translateY(16px)",
                  transition:
                    "opacity 0.3s ease 0.12s, transform 0.3s ease 0.12s",
                  pointerEvents: isExpanded ? "auto" : "none",
                }}
              >
                {/* Type badge */}
                <span
                  className="inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mb-3"
                  style={{ background: "rgba(242,89,18,0.9)", color: "#fff" }}
                >
                  {property.propertyType}
                </span>

                {/* Title */}
                <h3 className="text-white font-extrabold text-xl leading-snug mb-2 line-clamp-2">
                  {property.propertyTitle}
                </h3>

                {/* Description */}
                <p
                  className="text-sm mb-4 line-clamp-2"
                  style={{ color: "rgba(255,255,255,0.72)" }}
                >
                  {property.propertyDesc ||
                    "A premium property in a prime location."}
                </p>

                {/* Specs */}
                <div
                  className="flex items-center gap-3 text-xs mb-5 pb-4 flex-wrap"
                  style={{
                    color: "rgba(255,255,255,0.65)",
                    borderBottom: "1px solid rgba(255,255,255,0.12)",
                  }}
                >
                  {property.propertyRooms && (
                    <span>{property.propertyRooms} Rooms</span>
                  )}
                  <span style={{ opacity: 0.35 }}>·</span>
                  {property.propertyBeds && (
                    <span>{property.propertyBeds} Beds</span>
                  )}
                  <span style={{ opacity: 0.35 }}>·</span>
                  {property.propertySquare && (
                    <span>{property.propertySquare} ㎡</span>
                  )}
                </div>

                {/* Price + CTA */}
                <div className="flex items-end justify-between">
                  <div>
                    <p
                      className="text-[10px] font-bold uppercase tracking-widest mb-1"
                      style={{ color: "rgba(255,255,255,0.45)" }}
                    >
                      Price
                    </p>
                    <p className="text-white font-extrabold text-2xl leading-none">
                      ₩{(property.propertyPrice / 1_000_000).toFixed(0)}M
                    </p>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/property/details?id=${property._id}`);
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold text-white"
                    style={{
                      background: "#F25912",
                      boxShadow: "0 4px 20px rgba(242,89,18,0.45)",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                  >
                    View
                    <svg
                      width="13"
                      height="13"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      viewBox="0 0 24 24"
                    >
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default PopularProperties;
