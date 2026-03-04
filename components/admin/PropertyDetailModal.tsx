import { Property } from "@/lib/types/property/property";
import { PropertyStatus } from "@/lib/enums/property";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Cancel01Icon,
  Home01Icon,
  Location01Icon,
  BedIcon,
  DoorIcon,
  GridIcon,
  UserIcon,
} from "@hugeicons/core-free-icons";
import { useState } from "react";
import { getImageUrl } from "@/lib/utils";

interface Props {
  property: Property | null;
  onClose: () => void;
}

const statusColors: Record<PropertyStatus, string> = {
  [PropertyStatus.ACTIVE]: "bg-emerald-100 text-emerald-700",
  [PropertyStatus.SOLD]: "bg-blue-100   text-blue-700",
  [PropertyStatus.DELETE]: "bg-red-100    text-red-700",
};

const Stat = ({ label, value }: { label: string; value: number | string }) => (
  <div className="bg-slate-50 rounded-xl p-3 text-center">
    <p className="text-lg font-bold text-slate-900">{value}</p>
    <p className="text-xs text-slate-500 mt-0.5">{label}</p>
  </div>
);

const Tag = ({ label }: { label: string }) => (
  <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium">
    {label}
  </span>
);

export default function PropertyDetailModal({ property, onClose }: Props) {
  const [activeImg, setActiveImg] = useState(0);

  if (!property) return null;

  const images =
    property.propertyImages.map((image) => getImageUrl(image)) ?? [];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-lg bg-white shadow-2xl z-50 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <h2 className="text-base font-semibold text-slate-900">
            Property Details
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-500"
          >
            <HugeiconsIcon
              icon={Cancel01Icon}
              size={18}
              color="currentColor"
              strokeWidth={2}
            />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          {/* Image gallery */}
          {images.length > 0 ? (
            <div className="shrink-0">
              <img
                src={images[activeImg]}
                alt={property.propertyTitle}
                className="w-full h-56 object-cover bg-slate-100"
              />
              {images.length > 1 && (
                <div className="flex gap-2 px-4 py-3 overflow-x-auto">
                  {images.map((src, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImg(i)}
                      className={`shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-colors ${
                        i === activeImg
                          ? "border-[#F25912]"
                          : "border-transparent"
                      }`}
                    >
                      <img
                        src={src}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="w-full h-48 bg-slate-100 flex items-center justify-center shrink-0">
              <HugeiconsIcon
                icon={Home01Icon}
                size={40}
                color="#cbd5e1"
                strokeWidth={1.5}
              />
            </div>
          )}

          <div className="px-6 py-5 space-y-6">
            {/* Title + status */}
            <div>
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-lg font-bold text-slate-900 leading-snug">
                  {property.propertyTitle}
                </h3>
                <span
                  className={`shrink-0 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[property.propertyStatus]}`}
                >
                  {property.propertyStatus}
                </span>
              </div>
              <p className="text-2xl font-bold text-[#F25912] mt-1">
                ₩{property.propertyPrice.toLocaleString()}
              </p>
            </div>

            {/* Location */}
            <div className="flex items-start gap-2 text-sm text-slate-600">
              <HugeiconsIcon
                icon={Location01Icon}
                size={15}
                color="#94a3b8"
                strokeWidth={1.5}
                className="mt-0.5 shrink-0"
              />
              <span>
                {property.propertyAddress}, {property.propertyLocation}
              </span>
            </div>

            {/* Key specs */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Specifications
              </p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2 text-slate-700">
                  <HugeiconsIcon
                    icon={GridIcon}
                    size={15}
                    color="#94a3b8"
                    strokeWidth={1.5}
                  />
                  <span>{property.propertySquare} m²</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <HugeiconsIcon
                    icon={BedIcon}
                    size={15}
                    color="#94a3b8"
                    strokeWidth={1.5}
                  />
                  <span>{property.propertyBeds} beds</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <HugeiconsIcon
                    icon={DoorIcon}
                    size={15}
                    color="#94a3b8"
                    strokeWidth={1.5}
                  />
                  <span>{property.propertyRooms} rooms</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <HugeiconsIcon
                    icon={Home01Icon}
                    size={15}
                    color="#94a3b8"
                    strokeWidth={1.5}
                  />
                  <span>{property.propertyType}</span>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {property.propertyBarter && <Tag label="Barter available" />}
              {property.propertyRent && <Tag label="For rent" />}
              {property.constructedAt && (
                <Tag
                  label={`Built ${new Date(property.constructedAt).getFullYear()}`}
                />
              )}
            </div>

            {/* Description */}
            {property.propertyDesc && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Description
                </p>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {property.propertyDesc}
                </p>
              </div>
            )}

            {/* Stats */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Engagement
              </p>
              <div className="grid grid-cols-3 gap-2">
                <Stat label="Views" value={property.propertyViews} />
                <Stat label="Likes" value={property.propertyLikes} />
                <Stat label="Comments" value={property.propertyComments ?? 0} />
              </div>
            </div>

            {/* Owner */}
            {property.memberData && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Owner
                </p>
                <div className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3">
                  {property.memberData.memberImage ? (
                    <img
                      src={property.memberData.memberImage}
                      alt={property.memberData.memberNick}
                      className="w-9 h-9 rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                      <HugeiconsIcon
                        icon={UserIcon}
                        size={16}
                        color="#94a3b8"
                        strokeWidth={1.5}
                      />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {property.memberData.memberFullName ||
                        property.memberData.memberNick}
                    </p>
                    <p className="text-xs text-slate-500">
                      @{property.memberData.memberNick}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Dates */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Timestamps
              </p>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Listed</span>
                  <span className="text-slate-700">
                    {new Date(property.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Updated</span>
                  <span className="text-slate-700">
                    {new Date(property.updatedAt).toLocaleString()}
                  </span>
                </div>
                {property.soldAt && (
                  <div className="flex justify-between">
                    <span className="text-blue-500">Sold</span>
                    <span className="text-blue-600">
                      {new Date(property.soldAt).toLocaleString()}
                    </span>
                  </div>
                )}
                {property.deletedAt && (
                  <div className="flex justify-between">
                    <span className="text-red-500">Deleted</span>
                    <span className="text-red-600">
                      {new Date(property.deletedAt).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* ID */}
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                ID
              </p>
              <p className="text-xs font-mono text-slate-500 break-all bg-slate-50 px-3 py-2 rounded-lg">
                {property._id}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
