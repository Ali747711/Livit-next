import { NextPage } from "next";
import AdminLayout from "@/components/layouts/AdminLayout";
import { useQuery, useMutation } from "@apollo/client/react";
import { GET_ALL_PROPERTIES_BY_ADMIN } from "@/apollo/admin/query";
import {
  UPDATE_PROPERTY_BY_ADMIN,
  REMOVE_PROPERTY_BY_ADMIN,
} from "@/apollo/admin/mutation";
import { Property } from "@/lib/types/property/property";
import { AllPropertiesInquiry } from "@/lib/types/property/property.input";
import { PropertyStatus, PropertyLocation } from "@/lib/enums/property";
import { Direction } from "@/lib/enums/common";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import PropertyDetailModal from "@/components/admin/PropertyDetailModal";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Delete01Icon,
} from "@hugeicons/core-free-icons";
import { getImageUrl } from "@/lib/utils";

const statusColors: Record<PropertyStatus, string> = {
  [PropertyStatus.ACTIVE]: "bg-emerald-100 text-emerald-700",
  [PropertyStatus.SOLD]: "bg-blue-100   text-blue-700",
  [PropertyStatus.DELETE]: "bg-red-100    text-red-700",
};

const STATUS_TABS = ["ALL", ...Object.values(PropertyStatus)] as const;

const defaultInquiry: AllPropertiesInquiry = {
  page: 1,
  limit: 10,
  sort: "createdAt",
  direction: Direction.DESC,
  search: {},
};

const AdminProperties: NextPage = () => {
  const [inquiry, setInquiry] = useState<AllPropertiesInquiry>(defaultInquiry);
  const [properties, setProperties] = useState<Property[]>([]);
  const [total, setTotal] = useState(0);
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null,
  );

  const { refetch, data } = useQuery<any>(GET_ALL_PROPERTIES_BY_ADMIN, {
    fetchPolicy: "network-only",
    variables: { input: inquiry },
  });
  // console.log(data);

  useEffect(() => {
    setProperties(data?.getAllPropertiesByAdmin?.list ?? []);
    setTotal(data?.getAllPropertiesByAdmin?.metaCounter[0]?.total ?? 0);
  }, [data]);

  const [updateProperty] = useMutation(UPDATE_PROPERTY_BY_ADMIN);
  const [removeProperty] = useMutation(REMOVE_PROPERTY_BY_ADMIN);

  // Refetch whenever inquiry changes
  useEffect(() => {
    refetch({ input: inquiry });
  }, [inquiry]);

  const totalPages = Math.ceil(total / inquiry.limit);

  /* ── handlers ── */
  const tabChange = async (value: string) => {
    setActiveTab(value);
    setInquiry({ ...inquiry, page: 1, sort: "createdAt" });

    switch (value) {
      case "ACTIVE":
        setInquiry({
          ...inquiry,
          search: { propertyStatus: PropertyStatus.ACTIVE },
        });
        break;
      case "SOLD":
        setInquiry({
          ...inquiry,
          search: { propertyStatus: PropertyStatus.SOLD },
        });
        break;
      case "DELETE":
        setInquiry({
          ...inquiry,
          search: { propertyStatus: PropertyStatus.DELETE },
        });
        break;

      default:
        delete inquiry.search.propertyStatus;
        setInquiry({ ...inquiry });
        break;
    }
  };

  const locationFilterHandler = (val: string) => {
    setInquiry((prev) => ({
      ...prev,
      page: 1,
      search: {
        ...prev.search,
        propertyLocationList: val ? [val as PropertyLocation] : undefined,
      },
    }));
  };

  const pageHandler = (p: number) =>
    setInquiry((prev) => ({ ...prev, page: p }));

  const updateStatusHandler = async (
    id: string,
    propertyStatus: PropertyStatus,
  ) => {
    console.log(`ID: ${id}, STATUS: ${propertyStatus}`);
    try {
      await updateProperty({
        variables: { input: { _id: id, propertyStatus } },
      });
      await refetch({ input: inquiry });
      toast.success("Property updated");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const deleteHandler = async (id: string, title: string) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      await removeProperty({ variables: { input: id } });
      await refetch({ input: inquiry });
      toast.success("Property removed");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <AdminLayout title="Properties">
      {/* Status tabs */}
      <div className="flex gap-1 bg-white rounded-xl border border-slate-200 shadow-sm p-1 mb-6 w-fit">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => tabChange(tab)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab
                ? "bg-[#222831] text-white shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 mb-6 flex flex-wrap gap-3 items-center">
        <select
          onChange={(e) => locationFilterHandler(e.target.value)}
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F25912]/40 bg-white"
        >
          <option value="">All Locations</option>
          {Object.values(PropertyLocation).map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>

        <span className="text-sm text-slate-500 ml-auto">
          {total} properties
        </span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {[
                  "Property",
                  "Type",
                  "Location",
                  "Price",
                  "Status",
                  "Views",
                  "Likes",
                  "Owner",
                  "Created",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {properties.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-16 text-center text-slate-400">
                    No properties found
                  </td>
                </tr>
              ) : (
                properties.map((p: Property) => {
                  const imageUrl = getImageUrl(p.propertyImages[0]);
                  return (
                    <tr
                      key={p._id}
                      onClick={() => setSelectedProperty(p)}
                      className="hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      {/* Thumbnail + title */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {p.propertyImages?.[0] ? (
                            <img
                              src={imageUrl}
                              alt={p.propertyTitle}
                              className="w-10 h-10 rounded-lg object-cover shrink-0 bg-slate-100"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-slate-100 shrink-0" />
                          )}
                          <p className="font-medium text-slate-900 truncate max-w-35">
                            {p.propertyTitle}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                        {p.propertyType}
                      </td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                        {p.propertyLocation}
                      </td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                        ₩{p.propertyPrice.toLocaleString()}
                      </td>
                      {/* Status badge */}
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[p.propertyStatus]}`}
                        >
                          {p.propertyStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {p.propertyViews}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {p.propertyLikes}
                      </td>
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                        {(p as any).memberData?.memberNick ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                        {new Date(p.createdAt).toLocaleDateString()}
                      </td>
                      {/* Actions — status-dependent */}
                      <td
                        className="px-4 py-3"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {p.propertyStatus === PropertyStatus.ACTIVE && (
                          <select
                            value=""
                            onChange={(e) => {
                              if (e.target.value)
                                updateStatusHandler(
                                  p._id,
                                  e.target.value as PropertyStatus,
                                );
                            }}
                            className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#F25912]/40 bg-white"
                          >
                            <option value="" disabled>
                              Set status…
                            </option>
                            {Object.values(PropertyStatus)
                              .filter((s) => s !== PropertyStatus.ACTIVE)
                              .map((s) => (
                                <option key={s} value={s}>
                                  {s}
                                </option>
                              ))}
                          </select>
                        )}
                        {p.propertyStatus === PropertyStatus.DELETE && (
                          <div className="flex items-center gap-2">
                            <select
                              value=""
                              onChange={(e) => {
                                if (e.target.value)
                                  updateStatusHandler(
                                    p._id,
                                    e.target.value as PropertyStatus,
                                  );
                              }}
                              className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#F25912]/40 bg-white"
                            >
                              <option value="" disabled>
                                Set status…
                              </option>
                              {Object.values(PropertyStatus)
                                .filter((s) => s !== PropertyStatus.DELETE)
                                .map((s) => (
                                  <option key={s} value={s}>
                                    {s}
                                  </option>
                                ))}
                            </select>
                            <button
                              onClick={() =>
                                deleteHandler(p._id, p.propertyTitle)
                              }
                              className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                              title="Remove property"
                            >
                              <HugeiconsIcon
                                icon={Delete01Icon}
                                size={16}
                                color="currentColor"
                                strokeWidth={1.5}
                              />
                            </button>
                          </div>
                        )}
                        {p.propertyStatus === PropertyStatus.SOLD && (
                          <select
                            value=""
                            onChange={(e) => {
                              if (e.target.value)
                                updateStatusHandler(
                                  p._id,
                                  e.target.value as PropertyStatus,
                                );
                            }}
                            className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#F25912]/40 bg-white"
                          >
                            <option value="" disabled>
                              Set status…
                            </option>
                            {Object.values(PropertyStatus)
                              .filter((s) => s !== PropertyStatus.SOLD)
                              .map((s) => (
                                <option key={s} value={s}>
                                  {s}
                                </option>
                              ))}
                          </select>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            disabled={inquiry.page === 1}
            onClick={() => pageHandler(inquiry.page - 1)}
            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <HugeiconsIcon
              icon={ArrowLeft01Icon}
              size={16}
              color="currentColor"
              strokeWidth={2}
            />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => pageHandler(p)}
              className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                p === inquiry.page
                  ? "bg-[#222831] text-white"
                  : "border border-slate-200 hover:bg-slate-50 text-slate-700"
              }`}
            >
              {p}
            </button>
          ))}
          <button
            disabled={inquiry.page === totalPages}
            onClick={() => pageHandler(inquiry.page + 1)}
            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <HugeiconsIcon
              icon={ArrowRight01Icon}
              size={16}
              color="currentColor"
              strokeWidth={2}
            />
          </button>
        </div>
      )}
      <PropertyDetailModal
        property={selectedProperty}
        onClose={() => setSelectedProperty(null)}
      />
    </AdminLayout>
  );
};

export default AdminProperties;
