import { PropertyLocation, PropertyType } from "@/lib/enums/property";
import { PropertiesInquiry } from "@/lib/types/property/property.input";
import { useRouter } from "next/router";
import React, { useCallback, useState } from "react";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Location01Icon,
  Home01Icon,
  SquareIcon,
  RefreshIcon,
  BedIcon,
} from "@hugeicons/core-free-icons";
import { bedOptions, roomOptions } from "@/lib/config";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FilterProps {
  searchFilter: PropertiesInquiry;
  setSearchFilter: (filter: PropertiesInquiry) => void;
  initialInput: PropertiesInquiry;
}

const Filter: React.FC<FilterProps> = (props) => {
  const router = useRouter();
  const { searchFilter, setSearchFilter, initialInput } = props;

  const [propertyLocation] = useState<PropertyLocation[]>(
    Object.values(PropertyLocation),
  );
  const [propertyType] = useState<PropertyType[]>(Object.values(PropertyType));

  const propertyLocationSelectHandler = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      try {
        const isChecked = e.target.checked;
        const value = e.target.value as PropertyLocation;
        let newLocationList = [...(searchFilter.search.locationList || [])];
        if (isChecked) newLocationList.push(value);
        else newLocationList = newLocationList.filter((item) => item !== value);
        const newFilter = {
          ...searchFilter,
          page: 1,
          search: {
            ...searchFilter.search,
            locationList:
              newLocationList.length > 0 ? newLocationList : undefined,
          },
        };
        await router.push(
          `/property?input=${JSON.stringify(newFilter)}`,
          undefined,
          { scroll: false },
        );
      } catch (error: any) {
        toast.error(error.message);
      }
    },
    [searchFilter, router],
  );

  const propertyTypeSelectHandler = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      try {
        const isChecked = e.target.checked;
        const value = e.target.value as PropertyType;
        let newTypeList = [...(searchFilter.search.typeList || [])];
        if (isChecked) newTypeList.push(value);
        else newTypeList = newTypeList.filter((item) => item !== value);
        const newFilter = {
          ...searchFilter,
          page: 1,
          search: {
            ...searchFilter.search,
            typeList: newTypeList.length > 0 ? newTypeList : undefined,
          },
        };
        await router.push(
          `/property?input=${JSON.stringify(newFilter)}`,
          undefined,
          { scroll: false },
        );
      } catch (error: any) {
        toast.error(error.message);
      }
    },
    [searchFilter, router],
  );

  const propertyRoomSelectHandler = useCallback(
    async (number: number) => {
      try {
        let newRoomsList = [...(searchFilter.search.roomsList || [])];
        if (newRoomsList.includes(number))
          newRoomsList = newRoomsList.filter((item) => item !== number);
        else newRoomsList.push(number);
        const newFilter = {
          ...searchFilter,
          page: 1,
          search: {
            ...searchFilter.search,
            roomsList: newRoomsList.length > 0 ? newRoomsList : undefined,
          },
        };
        await router.push(
          `/property?input=${JSON.stringify(newFilter)}`,
          undefined,
          { scroll: false },
        );
      } catch (error: any) {
        toast.error(error.message);
      }
    },
    [searchFilter, router],
  );

  const propertyBedSelectHandler = useCallback(
    async (number: number) => {
      try {
        let newBedsList = [...(searchFilter.search.bedsList || [])];
        if (newBedsList.includes(number))
          newBedsList = newBedsList.filter((item) => item !== number);
        else newBedsList.push(number);
        const newFilter = {
          ...searchFilter,
          page: 1,
          search: {
            ...searchFilter.search,
            bedsList: newBedsList.length > 0 ? newBedsList : undefined,
          },
        };
        await router.push(
          `/property?input=${JSON.stringify(newFilter)}`,
          undefined,
          { scroll: false },
        );
      } catch (error: any) {
        toast.error(error.message);
      }
    },
    [searchFilter, router],
  );

  const propertySquareSelectHandler = useCallback(
    async (value: string, type: "start" | "end") => {
      try {
        const newFilter = {
          ...searchFilter,
          page: 1,
          search: {
            ...searchFilter.search,
            squaresRange: {
              start:
                type === "start"
                  ? parseInt(value) || 0
                  : searchFilter.search.squaresRange?.start || 0,
              end:
                type === "end"
                  ? parseInt(value) || 1000
                  : searchFilter.search.squaresRange?.end || 1000,
            },
          },
        };
        await router.push(
          `/property?input=${JSON.stringify(newFilter)}`,
          undefined,
          { scroll: false },
        );
      } catch (error: any) {
        toast.error(error.message);
      }
    },
    [searchFilter, router],
  );

  const propertyPriceSelectHandler = useCallback(
    async (value: string, type: "start" | "end") => {
      try {
        const newFilter = {
          ...searchFilter,
          page: 1,
          search: {
            ...searchFilter.search,
            pricesRange: {
              start:
                type === "start"
                  ? parseInt(value) || 0
                  : searchFilter.search.pricesRange?.start || 0,
              end:
                type === "end"
                  ? parseInt(value) || 999999999
                  : searchFilter.search.pricesRange?.end || 999999999,
            },
          },
        };
        await router.push(
          `/property?input=${JSON.stringify(newFilter)}`,
          undefined,
          { scroll: false },
        );
      } catch (error: any) {
        toast.error(error.message);
      }
    },
    [searchFilter, router],
  );

  const refreshHandler = useCallback(() => {
    try {
      router.push(
        `/property?input=${JSON.stringify(initialInput)}`,
        undefined,
        { scroll: false },
      );
    } catch (error: any) {
      toast.error(error.message);
    }
  }, [initialInput, router]);

  const hasActiveFilters =
    (searchFilter.search.locationList &&
      searchFilter.search.locationList.length > 0) ||
    (searchFilter.search.typeList && searchFilter.search.typeList.length > 0) ||
    (searchFilter.search.roomsList &&
      searchFilter.search.roomsList.length > 0) ||
    (searchFilter.search.bedsList && searchFilter.search.bedsList.length > 0) ||
    searchFilter.search.pricesRange?.start !==
      initialInput.search.pricesRange?.start ||
    searchFilter.search.pricesRange?.end !==
      initialInput.search.pricesRange?.end ||
    searchFilter.search.squaresRange?.start !==
      initialInput.search.squaresRange?.start ||
    searchFilter.search.squaresRange?.end !==
      initialInput.search.squaresRange?.end;

  const sectionTitle = "text-xs font-bold uppercase tracking-widest";

  return (
    <aside className="hidden lg:block w-72 flex-shrink-0">
      <div className="sticky top-24 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xl font-bold text-[#222831]">Filters</h2>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={refreshHandler}
              className="gap-1.5 text-[#F25912] hover:text-[#D94E0F] hover:bg-[#fef0e9] h-8 px-3"
            >
              <HugeiconsIcon
                icon={RefreshIcon}
                size={13}
                color="currentColor"
                strokeWidth={1.5}
              />
              Clear All
            </Button>
          )}
        </div>

        {/* Location */}
        <Card className="gap-0 py-0 border-[#e8e8e3] rounded-2xl overflow-hidden">
          <CardHeader className="px-5 pt-5 pb-3 border-b border-[#e8e8e3]">
            <CardTitle
              className={`${sectionTitle} flex items-center gap-2`}
              style={{ color: "#6b7280" }}
            >
              <HugeiconsIcon
                icon={Location01Icon}
                size={13}
                color="currentColor"
                strokeWidth={2}
              />
              Location
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 py-4 space-y-2.5">
            {propertyLocation.map((location) => (
              <Label
                key={location}
                className="flex items-center gap-2.5 cursor-pointer font-normal"
              >
                <input
                  type="checkbox"
                  value={location}
                  checked={
                    searchFilter.search.locationList?.includes(location) ||
                    false
                  }
                  onChange={propertyLocationSelectHandler}
                  className="w-4 h-4 rounded border-[#e8e8e3] accent-[#F25912] cursor-pointer"
                />
                <span className="text-sm" style={{ color: "#6b7280" }}>
                  {location}
                </span>
              </Label>
            ))}
          </CardContent>
        </Card>

        {/* Property Type */}
        <Card className="gap-0 py-0 border-[#e8e8e3] rounded-2xl overflow-hidden">
          <CardHeader className="px-5 pt-5 pb-3 border-b border-[#e8e8e3]">
            <CardTitle
              className={`${sectionTitle} flex items-center gap-2`}
              style={{ color: "#6b7280" }}
            >
              <HugeiconsIcon
                icon={Home01Icon}
                size={13}
                color="currentColor"
                strokeWidth={2}
              />
              Property Type
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 py-4 space-y-2.5">
            {propertyType.map((type) => (
              <Label
                key={type}
                className="flex items-center gap-2.5 cursor-pointer font-normal"
              >
                <input
                  type="checkbox"
                  value={type}
                  checked={
                    searchFilter.search.typeList?.includes(type) || false
                  }
                  onChange={propertyTypeSelectHandler}
                  className="w-4 h-4 rounded border-[#e8e8e3] accent-[#F25912] cursor-pointer"
                />
                <span className="text-sm" style={{ color: "#6b7280" }}>
                  {type}
                </span>
              </Label>
            ))}
          </CardContent>
        </Card>

        {/* Rooms */}
        <Card className="gap-0 py-0 border-[#e8e8e3] rounded-2xl overflow-hidden">
          <CardHeader className="px-5 pt-5 pb-3 border-b border-[#e8e8e3]">
            <CardTitle className={sectionTitle} style={{ color: "#6b7280" }}>
              Rooms
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 py-4">
            <div className="flex flex-wrap gap-2">
              {roomOptions.map((room) => {
                const isActive = searchFilter.search.roomsList?.includes(room);
                return (
                  <Button
                    key={room}
                    variant={isActive ? "default" : "outline"}
                    size="icon"
                    onClick={() => propertyRoomSelectHandler(room)}
                    className={
                      isActive
                        ? "w-11 h-11 rounded-xl bg-[#F25912] hover:bg-[#D94E0F] border-[#F25912] text-white"
                        : "w-11 h-11 rounded-xl border-[#e8e8e3] hover:border-[#F25912] text-[#222831]"
                    }
                  >
                    {room}+
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Bedrooms */}
        <Card className="gap-0 py-0 border-[#e8e8e3] rounded-2xl overflow-hidden">
          <CardHeader className="px-5 pt-5 pb-3 border-b border-[#e8e8e3]">
            <CardTitle
              className={`${sectionTitle} flex items-center gap-2`}
              style={{ color: "#6b7280" }}
            >
              <HugeiconsIcon
                icon={BedIcon}
                size={13}
                color="currentColor"
                strokeWidth={2}
              />
              Bedrooms
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 py-4">
            <div className="flex flex-wrap gap-2">
              {bedOptions.map((bed) => {
                const isActive = searchFilter.search.bedsList?.includes(bed);
                return (
                  <Button
                    key={bed}
                    variant={isActive ? "default" : "outline"}
                    size="icon"
                    onClick={() => propertyBedSelectHandler(bed)}
                    className={
                      isActive
                        ? "w-11 h-11 rounded-xl bg-[#F25912] hover:bg-[#D94E0F] border-[#F25912] text-white"
                        : "w-11 h-11 rounded-xl border-[#e8e8e3] hover:border-[#F25912] text-[#222831]"
                    }
                  >
                    {bed}+
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Price Range */}
        <Card className="gap-0 py-0 border-[#e8e8e3] rounded-2xl overflow-hidden">
          <CardHeader className="px-5 pt-5 pb-3 border-b border-[#e8e8e3]">
            <CardTitle className={sectionTitle} style={{ color: "#6b7280" }}>
              Price Range (₩)
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 py-4 space-y-2">
            <Input
              type="number"
              placeholder="Min Price"
              value={searchFilter.search.pricesRange?.start || ""}
              onChange={(e) =>
                propertyPriceSelectHandler(e.target.value, "start")
              }
              className="border-[#e8e8e3] rounded-xl focus-visible:ring-[#F25912]/30 focus-visible:border-[#F25912]"
            />
            <Input
              type="number"
              placeholder="Max Price"
              value={searchFilter.search.pricesRange?.end || ""}
              onChange={(e) =>
                propertyPriceSelectHandler(e.target.value, "end")
              }
              className="border-[#e8e8e3] rounded-xl focus-visible:ring-[#F25912]/30 focus-visible:border-[#F25912]"
            />
          </CardContent>
        </Card>

        {/* Square Footage */}
        <Card className="gap-0 py-0 border-[#e8e8e3] rounded-2xl overflow-hidden">
          <CardHeader className="px-5 pt-5 pb-3 border-b border-[#e8e8e3]">
            <CardTitle
              className={`${sectionTitle} flex items-center gap-2`}
              style={{ color: "#6b7280" }}
            >
              <HugeiconsIcon
                icon={SquareIcon}
                size={13}
                color="currentColor"
                strokeWidth={2}
              />
              Square Footage (㎡)
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 py-4 space-y-2">
            <Input
              type="number"
              placeholder="Min ㎡"
              value={searchFilter.search.squaresRange?.start || ""}
              onChange={(e) =>
                propertySquareSelectHandler(e.target.value, "start")
              }
              className="border-[#e8e8e3] rounded-xl focus-visible:ring-[#F25912]/30 focus-visible:border-[#F25912]"
            />
            <Input
              type="number"
              placeholder="Max ㎡"
              value={searchFilter.search.squaresRange?.end || ""}
              onChange={(e) =>
                propertySquareSelectHandler(e.target.value, "end")
              }
              className="border-[#e8e8e3] rounded-xl focus-visible:ring-[#F25912]/30 focus-visible:border-[#F25912]"
            />
          </CardContent>
        </Card>
      </div>
    </aside>
  );
};

export default Filter;
