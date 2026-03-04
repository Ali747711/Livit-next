import React from "react";
import { useRouter } from "next/router";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Location01Icon,
  Home01Icon,
  SquareIcon,
  EyeIcon,
  FavouriteIcon,
  BedIcon,
} from "@hugeicons/core-free-icons";
import { Property } from "@/lib/types/property/property";
import { getImageUrl } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface PropertyCardProps {
  property: Property;
  onLike?: (propertyId: string) => void;
  onClick?: (propertyId: string) => void;
  likeLoading?: boolean;
}

const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  onLike,
  onClick,
  likeLoading = false,
}) => {
  const router = useRouter();

  const handleCardClick = () => {
    if (onClick) {
      onClick(property._id);
    } else {
      router.push(`/property/details?id=${property._id}`);
    }
  };

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onLike && !likeLoading) {
      onLike(property._id);
    }
  };

  return (
    <Card
      className="group p-0 gap-0 overflow-hidden cursor-pointer rounded-2xl border-[#e8e8e3] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
      onClick={handleCardClick}
    >
      {/* Property Image */}
      <div className="relative h-56 bg-[#f7f7f5] overflow-hidden">
        {property.propertyImages && property.propertyImages[0] ? (
          <img
            src={getImageUrl(property.propertyImages[0])}
            alt={property.propertyTitle}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <HugeiconsIcon icon={Home01Icon} size={64} color="#d1d5db" strokeWidth={1.5} />
          </div>
        )}

        {/* Like Button */}
        {onLike && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLikeClick}
            disabled={likeLoading}
            className="absolute top-3 right-3 rounded-full bg-white/90 hover:bg-white shadow-md h-9 w-9"
          >
            <HugeiconsIcon
              icon={FavouriteIcon}
              size={18}
              color={property.meLiked?.[0]?.myFavorite ? "#F25912" : "#9ca3af"}
              fill={property.meLiked?.[0]?.myFavorite ? "#F25912" : "none"}
              strokeWidth={1.5}
            />
          </Button>
        )}

        {/* Property Type Badge */}
        {property.propertyType && (
          <div className="absolute top-3 left-3">
            <span
              className="px-3 py-1 text-white text-xs font-bold uppercase tracking-wide rounded-full"
              style={{ background: "#F25912" }}
            >
              {property.propertyType}
            </span>
          </div>
        )}

        {/* For Rent Badge */}
        {property.propertyRent && (
          <div className="absolute bottom-3 left-3">
            <span
              className="px-3 py-1 text-white text-xs font-bold uppercase tracking-wide rounded-full"
              style={{ background: "#222831" }}
            >
              For Rent
            </span>
          </div>
        )}
      </div>

      {/* Property Info */}
      <CardContent className="p-5">
        <h3 className="text-lg font-semibold line-clamp-1 mb-1" style={{ color: "#222831" }}>
          {property.propertyTitle}
        </h3>

        {property.propertyAddress && (
          <div className="flex items-center gap-1 text-sm mb-4" style={{ color: "#6b7280" }}>
            <HugeiconsIcon icon={Location01Icon} size={14} color="currentColor" strokeWidth={1.5} />
            <span className="line-clamp-1">{property.propertyAddress}</span>
          </div>
        )}

        {/* Features row */}
        <div className="flex items-center flex-wrap gap-x-1 text-sm mb-4" style={{ color: "#6b7280" }}>
          {property.propertyBeds !== undefined && (
            <div className="flex items-center gap-1">
              <HugeiconsIcon icon={BedIcon} size={14} color="currentColor" strokeWidth={1.5} />
              <span>{property.propertyBeds} bed{property.propertyBeds !== 1 ? "s" : ""}</span>
            </div>
          )}
          {property.propertyRooms !== undefined && (
            <>
              <span className="mx-1 opacity-30">·</span>
              <div className="flex items-center gap-1">
                <HugeiconsIcon icon={Home01Icon} size={14} color="currentColor" strokeWidth={1.5} />
                <span>{property.propertyRooms} room{property.propertyRooms !== 1 ? "s" : ""}</span>
              </div>
            </>
          )}
          {property.propertySquare !== undefined && (
            <>
              <span className="mx-1 opacity-30">·</span>
              <div className="flex items-center gap-1">
                <HugeiconsIcon icon={SquareIcon} size={14} color="currentColor" strokeWidth={1.5} />
                <span>{property.propertySquare}㎡</span>
              </div>
            </>
          )}
        </div>

        {/* Price + Stats */}
        <div className="flex items-center justify-between pt-4 border-t border-[#e8e8e3]">
          <span className="text-xl font-bold" style={{ color: "#222831" }}>
            ₩{property.propertyPrice?.toLocaleString()}
          </span>
          <div className="flex items-center gap-3 text-sm" style={{ color: "#9ca3af" }}>
            {property.propertyLikes !== undefined && (
              <div className="flex items-center gap-1">
                <HugeiconsIcon icon={FavouriteIcon} size={13} color="#F25912" fill="#F25912" strokeWidth={1.5} />
                <span>{property.propertyLikes}</span>
              </div>
            )}
            {property.propertyViews !== undefined && (
              <div className="flex items-center gap-1">
                <HugeiconsIcon icon={EyeIcon} size={13} color="currentColor" strokeWidth={1.5} />
                <span>{property.propertyViews}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyCard;
