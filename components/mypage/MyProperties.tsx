import React, { useEffect, useState } from "react";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useMutation, useQuery, useReactiveVar } from "@apollo/client/react";
import { toast } from "sonner";
import { userVar } from "@/apollo/store";
import { UPDATE_PROPERTY } from "@/apollo/user/mutation";
import { GET_AGENT_PROPERTIES } from "@/apollo/user/query";
import { PropertyStatus } from "@/lib/enums/property";
import { Property } from "@/lib/types/property/property";
import { AgentPropertiesInquiry } from "@/lib/types/property/property.input";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Home01Icon,
  Delete02Icon,
  PencilEdit01Icon,
  EyeIcon,
  CheckmarkCircle02Icon,
  Add01Icon,
} from "@hugeicons/core-free-icons";
import { getImageUrl } from "@/lib/utils";

const defaultInput: AgentPropertiesInquiry = {
  page: 1,
  limit: 6,
  sort: "createdAt",
  search: { propertyStatus: PropertyStatus.ACTIVE },
};

// ── Pagination ────────────────────────────────────────────────────────────────
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
  const pages = Array.from({ length: total }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === total || Math.abs(p - current) <= 1,
  );

  return (
    <div className="flex items-center justify-center gap-1.5 mt-8">
      <button
        disabled={current === 1}
        onClick={() => onChange(current - 1)}
        className="px-3 py-2 rounded-lg text-sm font-semibold border disabled:opacity-40 transition-all"
        style={{ borderColor: "#ebebeb", color: "#374151" }}
      >
        Prev
      </button>
      {pages.map((p, i, arr) => (
        <React.Fragment key={p}>
          {i > 0 && p - arr[i - 1] > 1 && (
            <span className="px-1 text-sm" style={{ color: "#9ca3af" }}>
              …
            </span>
          )}
          <button
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
        </React.Fragment>
      ))}
      <button
        disabled={current === total}
        onClick={() => onChange(current + 1)}
        className="px-3 py-2 rounded-lg text-sm font-semibold border disabled:opacity-40 transition-all"
        style={{ borderColor: "#ebebeb", color: "#374151" }}
      >
        Next
      </button>
    </div>
  );
};

const MyProperties: NextPage = ({ initialInput = defaultInput }: any) => {
  const router = useRouter();
  const user = useReactiveVar(userVar);
  const [searchFilter, setSearchFilter] =
    useState<AgentPropertiesInquiry>(initialInput);
  const [agentProperties, setAgentProperties] = useState<Property[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [confirmModal, setConfirmModal] = useState<{
    show: boolean;
    action: "delete" | "update" | null;
    propertyId: string;
    newStatus?: string;
  }>({ show: false, action: null, propertyId: "" });

  const [updateProperty, { loading: updating }] = useMutation(UPDATE_PROPERTY);
  const {
    loading,
    data: AgentPropertiesData,
    refetch,
  } = useQuery<any>(GET_AGENT_PROPERTIES, {
    fetchPolicy: "network-only",
    variables: { input: searchFilter },
    notifyOnNetworkStatusChange: true,
  });

  useEffect(() => {
    if (AgentPropertiesData?.getAgentProperties) {
      setAgentProperties(AgentPropertiesData.getAgentProperties.list || []);
      setTotal(
        AgentPropertiesData.getAgentProperties.metaCounter?.[0]?.total ?? 0,
      );
    }
  }, [AgentPropertiesData]);

  useEffect(() => {
    if (user && user.memberType !== "AGENT") {
      toast.error("Agents only");
      router.back();
    }
  }, [user]);

  const changeStatus = (status: PropertyStatus) =>
    setSearchFilter({
      ...searchFilter,
      page: 1,
      search: { propertyStatus: status },
    });

  const confirmAction = async () => {
    try {
      const { action, propertyId, newStatus } = confirmModal;
      if (action === "delete") {
        await updateProperty({
          variables: { input: { _id: propertyId, propertyStatus: "DELETE" } },
        });
        toast.success("Property deleted");
      } else if (action === "update" && newStatus) {
        await updateProperty({
          variables: { input: { _id: propertyId, propertyStatus: newStatus } },
        });
        toast.success(`Status updated to ${newStatus}`);
      }
      await refetch({ input: searchFilter });
      setConfirmModal({ show: false, action: null, propertyId: "" });
    } catch (err: any) {
      toast.error(err.message || "Failed");
    }
  };

  const totalPages = Math.ceil(total / searchFilter.limit);
  const isActive = searchFilter.search.propertyStatus === PropertyStatus.ACTIVE;

  return (
    <>
      <div className="space-y-5">
        {/* Header */}
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
          <div className="p-6 flex items-center justify-between">
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
                  My Listings
                </span>
              </div>
              <h1
                className="text-xl font-extrabold"
                style={{ color: "#222831" }}
              >
                My Properties
              </h1>
            </div>
            <button
              onClick={() =>
                router.push({
                  pathname: "/mypage",
                  query: { category: "addProperty" },
                })
              }
              className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold text-white transition-all"
              style={{
                background: "#F25912",
                boxShadow: "0 4px 14px rgba(242,89,18,0.28)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              <HugeiconsIcon
                icon={Add01Icon}
                size={15}
                color="white"
                strokeWidth={2.5}
              />
              Add Property
            </button>
          </div>
        </div>

        {/* Status tabs */}
        <div
          className="flex rounded-xl overflow-hidden p-1 gap-1"
          style={{ background: "#fff", border: "1px solid #ebebeb" }}
        >
          {[
            { label: "On Sale", status: PropertyStatus.ACTIVE },
            { label: "Sold", status: PropertyStatus.SOLD },
          ].map(({ label, status }) => (
            <button
              key={status}
              onClick={() => changeStatus(status)}
              className="flex-1 py-2.5 rounded-lg text-sm font-bold transition-all"
              style={{
                background:
                  searchFilter.search.propertyStatus === status
                    ? "#222831"
                    : "transparent",
                color:
                  searchFilter.search.propertyStatus === status
                    ? "#fff"
                    : "#6b7280",
              }}
            >
              {label}{" "}
              {searchFilter.search.propertyStatus === status
                ? `(${total})`
                : ""}
            </button>
          ))}
        </div>

        {/* List */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: "#fff", border: "1px solid #ebebeb" }}
        >
          {loading ? (
            <div className="p-8 space-y-3">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-20 rounded-xl animate-pulse"
                  style={{ background: "#f3f4f6" }}
                />
              ))}
            </div>
          ) : agentProperties.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: "#f3f4f6" }}
              >
                <HugeiconsIcon
                  icon={Home01Icon}
                  size={28}
                  color="#d1d5db"
                  strokeWidth={1}
                />
              </div>
              <p
                className="text-sm font-semibold mb-1"
                style={{ color: "#374151" }}
              >
                No properties found
              </p>
              <p className="text-xs mb-5" style={{ color: "#9ca3af" }}>
                {isActive
                  ? "Start adding your listings"
                  : "No sold properties yet"}
              </p>
              {isActive && (
                <button
                  onClick={() =>
                    router.push({
                      pathname: "/mypage",
                      query: { category: "addProperty" },
                    })
                  }
                  className="px-5 py-2.5 rounded-full text-sm font-bold text-white"
                  style={{ background: "#F25912" }}
                >
                  Add Your First Property
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Table header */}
              <div
                className="hidden md:grid md:grid-cols-12 gap-4 px-6 py-3 text-xs font-bold uppercase tracking-wide"
                style={{
                  background: "#f9fafb",
                  borderBottom: "1px solid #f3f4f6",
                  color: "#9ca3af",
                }}
              >
                <div className="col-span-5">Property</div>
                <div className="col-span-2">Date</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-1">Views</div>
                {isActive && <div className="col-span-2">Actions</div>}
              </div>

              {agentProperties.map((property) => (
                <div
                  key={property._id}
                  className="grid md:grid-cols-12 gap-4 px-6 py-4 transition-colors"
                  style={{ borderBottom: "1px solid #f9fafb" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#fafafa")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  {/* Info */}
                  <div className="col-span-12 md:col-span-5 flex gap-3 items-center">
                    <div
                      className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0"
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
                            size={22}
                            color="#d1d5db"
                            strokeWidth={1}
                          />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p
                        className="text-sm font-bold truncate"
                        style={{ color: "#222831" }}
                      >
                        {property.propertyTitle}
                      </p>
                      <p
                        className="text-xs truncate mb-1"
                        style={{ color: "#9ca3af" }}
                      >
                        {property.propertyAddress}
                      </p>
                      <p
                        className="text-sm font-extrabold"
                        style={{ color: "#F25912" }}
                      >
                        ₩{property.propertyPrice?.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Date */}
                  <div className="col-span-6 md:col-span-2 flex items-center">
                    <span className="text-xs" style={{ color: "#6b7280" }}>
                      {new Date(property.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Status */}
                  <div className="col-span-6 md:col-span-2 flex items-center">
                    <span
                      className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase"
                      style={{
                        background:
                          property.propertyStatus === PropertyStatus.ACTIVE
                            ? "#f0fdf4"
                            : "#f9fafb",
                        color:
                          property.propertyStatus === PropertyStatus.ACTIVE
                            ? "#16a34a"
                            : "#6b7280",
                      }}
                    >
                      {property.propertyStatus}
                    </span>
                  </div>

                  {/* Views */}
                  <div className="col-span-6 md:col-span-1 flex items-center gap-1.5">
                    <HugeiconsIcon
                      icon={EyeIcon}
                      size={14}
                      color="#9ca3af"
                      strokeWidth={1.5}
                    />
                    <span
                      className="text-xs font-semibold"
                      style={{ color: "#374151" }}
                    >
                      {property.propertyViews || 0}
                    </span>
                  </div>

                  {/* Actions */}
                  {isActive && (
                    <div className="col-span-6 md:col-span-2 flex items-center gap-2">
                      <button
                        onClick={() =>
                          router.push(
                            `/mypage?category=editProperty&propertyId=${property._id}`,
                          )
                        }
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all"
                        style={{
                          background: "#f9fafb",
                          color: "#374151",
                          border: "1px solid #ebebeb",
                        }}
                        onMouseEnter={(e) => {
                          (
                            e.currentTarget as HTMLButtonElement
                          ).style.background = "#fff3ee";
                          (e.currentTarget as HTMLButtonElement).style.color =
                            "#F25912";
                          (
                            e.currentTarget as HTMLButtonElement
                          ).style.borderColor = "#F25912";
                        }}
                        onMouseLeave={(e) => {
                          (
                            e.currentTarget as HTMLButtonElement
                          ).style.background = "#f9fafb";
                          (e.currentTarget as HTMLButtonElement).style.color =
                            "#374151";
                          (
                            e.currentTarget as HTMLButtonElement
                          ).style.borderColor = "#ebebeb";
                        }}
                      >
                        <HugeiconsIcon
                          icon={PencilEdit01Icon}
                          size={13}
                          color="currentColor"
                          strokeWidth={2}
                        />
                        Edit
                      </button>
                      <button
                        onClick={() =>
                          setConfirmModal({
                            show: true,
                            action: "delete",
                            propertyId: property._id,
                          })
                        }
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all"
                        style={{
                          background: "#fef2f2",
                          color: "#ef4444",
                          border: "1px solid #fecaca",
                        }}
                        onMouseEnter={(e) => {
                          (
                            e.currentTarget as HTMLButtonElement
                          ).style.background = "#ef4444";
                          (e.currentTarget as HTMLButtonElement).style.color =
                            "#fff";
                        }}
                        onMouseLeave={(e) => {
                          (
                            e.currentTarget as HTMLButtonElement
                          ).style.background = "#fef2f2";
                          (e.currentTarget as HTMLButtonElement).style.color =
                            "#ef4444";
                        }}
                      >
                        <HugeiconsIcon
                          icon={Delete02Icon}
                          size={13}
                          color="currentColor"
                          strokeWidth={2}
                        />
                        Del
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </>
          )}
        </div>

        <Pagination
          current={searchFilter.page}
          total={totalPages}
          onChange={(p) => setSearchFilter({ ...searchFilter, page: p })}
        />
      </div>

      {/* Confirm modal */}
      {confirmModal.show && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ background: "rgba(0,0,0,0.5)" }}
        >
          <div
            className="rounded-2xl p-6 max-w-sm w-full"
            style={{ background: "#fff" }}
          >
            <div className="text-center mb-6">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{
                  background:
                    confirmModal.action === "delete" ? "#fef2f2" : "#fff3ee",
                }}
              >
                <HugeiconsIcon
                  icon={
                    confirmModal.action === "delete"
                      ? Delete02Icon
                      : CheckmarkCircle02Icon
                  }
                  size={28}
                  color={
                    confirmModal.action === "delete" ? "#ef4444" : "#F25912"
                  }
                  strokeWidth={1.5}
                />
              </div>
              <h3
                className="text-lg font-extrabold mb-1"
                style={{ color: "#222831" }}
              >
                Confirm{" "}
                {confirmModal.action === "delete" ? "Deletion" : "Update"}
              </h3>
              <p className="text-sm" style={{ color: "#9ca3af" }}>
                {confirmModal.action === "delete"
                  ? "This property will be permanently removed."
                  : `Status will be changed to ${confirmModal.newStatus}.`}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() =>
                  setConfirmModal({ show: false, action: null, propertyId: "" })
                }
                disabled={updating}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold border"
                style={{ borderColor: "#ebebeb", color: "#374151" }}
              >
                Cancel
              </button>
              <button
                onClick={confirmAction}
                disabled={updating}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50"
                style={{
                  background:
                    confirmModal.action === "delete" ? "#ef4444" : "#F25912",
                }}
              >
                {updating ? "…" : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MyProperties;
