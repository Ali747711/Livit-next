import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { PropertyLocation, PropertyType } from "@/lib/enums/property";
import { PropertiesInquiry } from "@/lib/types/property/property.input";
import { propertySquare, propertyYears } from "@/lib/config";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Search01Icon,
  FilterIcon,
  ArrowDown01Icon,
  Cancel01Icon,
  FilterEditIcon,
} from "@hugeicons/core-free-icons";
import PremiumButton from "../premium-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const thisYear = new Date().getFullYear();

const defaultInput = {
  page: 1,
  limit: 9,
  search: {},
};

const HeaderFilter = ({ initialInput = defaultInput }: any) => {
  const router = useRouter();

  const [searchFilter, setSearchFilter] =
    useState<PropertiesInquiry>(initialInput);
  const [openAdvancedFilter, setOpenAdvancedFilter] = useState(false);
  const [openLocation, setOpenLocation] = useState(false);
  const [openType, setOpenType] = useState(false);
  const [openRooms, setOpenRooms] = useState(false);
  const [propertyLocation] = useState<PropertyLocation[]>(
    Object.values(PropertyLocation),
  );
  const [propertyType] = useState<PropertyType[]>(Object.values(PropertyType));
  const [yearCheck, setYearCheck] = useState({ start: 1970, end: thisYear });
  const [optionCheck, setOptionCheck] = useState("all");

  // ── Lifecycle ────────────────────────────────────────────────────────
  useEffect(() => {
    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenAdvancedFilter(false);
    };
    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  }, []);

  // ── Handlers (unchanged logic) ────────────────────────────────────────
  const advancedFilterHandler = (status: boolean) => {
    setOpenLocation(false);
    setOpenRooms(false);
    setOpenType(false);
    setOpenAdvancedFilter(status);
  };

  const disableAllStateHandler = () => {
    setOpenRooms(false);
    setOpenType(false);
    setOpenLocation(false);
  };

  const propertyLocationSelectHandler = useCallback(
    async (value: any) => {
      setSearchFilter({
        ...searchFilter,
        search: { ...searchFilter.search, locationList: [value] },
      });
      setOpenLocation(false);
      setOpenType(true);
    },
    [searchFilter],
  );

  const propertyTypeSelectHandler = useCallback(
    async (value: any) => {
      setSearchFilter({
        ...searchFilter,
        search: { ...searchFilter.search, typeList: [value] },
      });
      setOpenType(false);
      setOpenRooms(true);
    },
    [searchFilter],
  );

  const propertyRoomSelectHandler = useCallback(
    async (value: any) => {
      setSearchFilter({
        ...searchFilter,
        search: { ...searchFilter.search, roomsList: [value] },
      });
      disableAllStateHandler();
    },
    [searchFilter],
  );

  const propertyBedSelectHandler = useCallback(
    async (number: Number) => {
      if (number != 0) {
        if (searchFilter?.search?.bedsList?.includes(number)) {
          setSearchFilter({
            ...searchFilter,
            search: {
              ...searchFilter.search,
              bedsList: searchFilter?.search?.bedsList?.filter(
                (item: Number) => item !== number,
              ),
            },
          });
        } else {
          setSearchFilter({
            ...searchFilter,
            search: {
              ...searchFilter.search,
              bedsList: [...(searchFilter?.search?.bedsList || []), number],
            },
          });
        }
      } else {
        delete searchFilter?.search.bedsList;
        setSearchFilter({ ...searchFilter });
      }
    },
    [searchFilter],
  );

  const propertyOptionSelectHandler = useCallback(
    async (value: string) => {
      setOptionCheck(value);
      if (value !== "all") {
        setSearchFilter({
          ...searchFilter,
          search: { ...searchFilter.search, options: [value] },
        });
      } else {
        delete searchFilter.search.options;
        setSearchFilter({ ...searchFilter });
      }
    },
    [searchFilter],
  );

  const propertySquareHandler = useCallback(
    async (e: any, type: string) => {
      const value = e.target.value;
      setSearchFilter({
        ...searchFilter,
        search: {
          ...searchFilter.search,
          // @ts-ignore
          squaresRange: {
            ...searchFilter.search.squaresRange,
            [type]: parseInt(value),
          },
        },
      });
    },
    [searchFilter],
  );

  const yearStartChangeHandler = async (event: any) => {
    setYearCheck({ ...yearCheck, start: Number(event.target.value) });
    setSearchFilter({
      ...searchFilter,
      search: {
        ...searchFilter.search,
        periodsRange: { start: Number(event.target.value), end: yearCheck.end },
      },
    });
  };

  const yearEndChangeHandler = async (event: any) => {
    setYearCheck({ ...yearCheck, end: Number(event.target.value) });
    setSearchFilter({
      ...searchFilter,
      search: {
        ...searchFilter.search,
        periodsRange: {
          start: yearCheck.start,
          end: Number(event.target.value),
        },
      },
    });
  };

  const resetFilterHandler = () => {
    setSearchFilter(initialInput);
    setOptionCheck("all");
    setYearCheck({ start: 1970, end: thisYear });
  };

  const pushSearchHandler = async () => {
    const filter = { ...searchFilter, search: { ...searchFilter.search } };
    if (!filter?.search?.locationList?.length)
      delete filter.search.locationList;
    if (!filter?.search?.typeList?.length) delete filter.search.typeList;
    if (!filter?.search?.roomsList?.length) delete filter.search.roomsList;
    if (!filter?.search?.options?.length) delete filter.search.options;
    if (!filter?.search?.bedsList?.length) delete filter.search.bedsList;
    await router.push(`/property?input=${JSON.stringify(filter)}`);
    setOpenAdvancedFilter(false);
  };

  // ── Shared dropdown button style ─────────────────────────────────────
  const dropdownBtnCls = (open: boolean) =>
    `w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl transition-all text-sm font-semibold ${
      open ? "bg-orange-50 text-orange-500" : "hover:bg-white/10 text-white/80"
    }`;

  return (
    <>
      {/* ─── Main Search Bar ─────────────────────────────────────────── */}
      <div
        className="relative flex flex-col md:flex-row items-stretch md:items-center gap-1"
        style={{
          background: "rgba(255,255,255,0.08)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.14)",
          borderRadius: "16px",
          padding: "6px",
        }}
      >
        {/* Location Dropdown */}
        <DropdownMenu open={openLocation} onOpenChange={setOpenLocation}>
          <DropdownMenuTrigger asChild>
            <button className={`flex-1 ${dropdownBtnCls(openLocation)}`}>
              <div className="flex flex-col items-start">
                <span
                  className="text-[10px] font-bold uppercase tracking-wider mb-0.5"
                  style={{ color: "rgba(255,255,255,0.35)" }}
                >
                  Location
                </span>
                <span className="truncate text-sm">
                  {searchFilter?.search?.locationList?.[0] ?? "Any location"}
                </span>
              </div>
              <HugeiconsIcon
                icon={ArrowDown01Icon}
                size={15}
                color="currentColor"
                strokeWidth={2}
                className={`flex-shrink-0 transition-transform duration-200 ${openLocation ? "rotate-180" : ""}`}
              />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-72 p-1.5">
            <div className="grid grid-cols-2 gap-1.5">
              {propertyLocation.map((location) => (
                <button
                  key={location}
                  onClick={() => propertyLocationSelectHandler(location)}
                  className="relative overflow-hidden rounded-xl text-white font-bold text-xs transition-all hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    height: "80px",
                    background: "#222831",
                    outline:
                      searchFilter?.search?.locationList?.[0] === location
                        ? "2px solid #F25912"
                        : "none",
                    outlineOffset: "2px",
                  }}
                >
                  <img
                    src={`/img/banner/cities/${location}.webp`}
                    alt={location}
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                  <div className="absolute inset-0 bg-black/45" />
                  <span className="relative z-10">{location}</span>
                </button>
              ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Divider */}
        <div
          className="hidden md:block w-px h-8 opacity-20"
          style={{ background: "#fff" }}
        />

        {/* Property Type Dropdown */}
        <DropdownMenu open={openType} onOpenChange={setOpenType}>
          <DropdownMenuTrigger asChild>
            <button className={`flex-1 ${dropdownBtnCls(openType)}`}>
              <div className="flex flex-col items-start">
                <span
                  className="text-[10px] font-bold uppercase tracking-wider mb-0.5"
                  style={{ color: "rgba(255,255,255,0.35)" }}
                >
                  Type
                </span>
                <span className="truncate text-sm">
                  {searchFilter?.search?.typeList?.[0] ?? "Any type"}
                </span>
              </div>
              <HugeiconsIcon
                icon={ArrowDown01Icon}
                size={15}
                color="currentColor"
                strokeWidth={2}
                className={`flex-shrink-0 transition-transform duration-200 ${openType ? "rotate-180" : ""}`}
              />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-72 p-1.5">
            <div className="grid grid-cols-2 gap-1.5">
              {propertyType.map((type) => (
                <button
                  key={type}
                  onClick={() => propertyTypeSelectHandler(type)}
                  className="relative overflow-hidden rounded-xl text-white font-bold text-xs transition-all hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    height: "80px",
                    background: "#222831",
                    outline:
                      searchFilter?.search?.typeList?.[0] === type
                        ? "2px solid #F25912"
                        : "none",
                    outlineOffset: "2px",
                  }}
                >
                  <img
                    src={`/img/banner/types/${type.toLowerCase()}.webp`}
                    alt={type}
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                  <div className="absolute inset-0 bg-black/45" />
                  <span className="relative z-10">{type}</span>
                </button>
              ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Divider */}
        <div
          className="hidden md:block w-px h-8 opacity-20"
          style={{ background: "#fff" }}
        />

        {/* Rooms Dropdown */}
        <DropdownMenu open={openRooms} onOpenChange={setOpenRooms}>
          <DropdownMenuTrigger asChild>
            <button className={`flex-1 ${dropdownBtnCls(openRooms)}`}>
              <div className="flex flex-col items-start">
                <span
                  className="text-[10px] font-bold uppercase tracking-wider mb-0.5"
                  style={{ color: "rgba(255,255,255,0.35)" }}
                >
                  Rooms
                </span>
                <span className="truncate text-sm">
                  {searchFilter?.search?.roomsList?.[0]
                    ? `${searchFilter.search.roomsList[0]} rooms`
                    : "Any rooms"}
                </span>
              </div>
              <HugeiconsIcon
                icon={ArrowDown01Icon}
                size={15}
                color="currentColor"
                strokeWidth={2}
                className={`flex-shrink-0 transition-transform duration-200 ${openRooms ? "rotate-180" : ""}`}
              />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-44 p-1.5">
            {[1, 2, 3, 4, 5].map((room) => (
              <button
                key={room}
                onClick={() => propertyRoomSelectHandler(room)}
                className="w-full px-4 py-2.5 rounded-xl text-sm font-semibold text-left transition-all"
                style={
                  searchFilter?.search?.roomsList?.[0] === room
                    ? { background: "#F25912", color: "#fff" }
                    : { color: "#374151" }
                }
                onMouseEnter={(e) => {
                  if (searchFilter?.search?.roomsList?.[0] !== room) {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "#f7f7f5";
                  }
                }}
                onMouseLeave={(e) => {
                  if (searchFilter?.search?.roomsList?.[0] !== room) {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "transparent";
                  }
                }}
              >
                {room} room{room > 1 ? "s" : ""}
              </button>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pl-1">
          <button
            onClick={() => advancedFilterHandler(true)}
            className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all"
            style={{
              color: "rgba(255,255,255,0.6)",
              background: "rgba(255,255,255,0.07)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "rgba(255,255,255,0.13)";
              (e.currentTarget as HTMLButtonElement).style.color = "#fff";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "rgba(255,255,255,0.07)";
              (e.currentTarget as HTMLButtonElement).style.color =
                "rgba(255,255,255,0.6)";
            }}
          >
            <HugeiconsIcon
              icon={FilterIcon}
              size={17}
              color="currentColor"
              strokeWidth={1.5}
            />
            <span className="hidden md:inline">Filters</span>
          </button>

          <PremiumButton
            text="Search"
            onClick={pushSearchHandler}
            className="font-bold rounded-xl shadow-lg bg-[#F25912] text-white"
            // style={{ background: "#F25912", color: "#fff", boxShadow: "0 4px 20px rgba(242,89,18,0.35)" }}
          />
        </div>
      </div>

      {/* ─── Advanced Filter Modal ────────────────────────────────────── */}
      {openAdvancedFilter && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            background: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(4px)",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) advancedFilterHandler(false);
          }}
        >
          <div
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl"
            style={{ background: "#fff" }}
          >
            {/* Modal Header */}
            <div
              className="flex items-center justify-between p-6"
              style={{ borderBottom: "1px solid #ebebeb" }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: "#fff3ee" }}
                >
                  <HugeiconsIcon
                    icon={FilterEditIcon}
                    size={20}
                    color="#F25912"
                    strokeWidth={1.5}
                  />
                </div>
                <div>
                  <h2
                    className="text-lg font-extrabold"
                    style={{ color: "#222831" }}
                  >
                    Advanced Filters
                  </h2>
                  <p className="text-xs" style={{ color: "#9ca3af" }}>
                    Refine your property search
                  </p>
                </div>
              </div>
              <button
                onClick={() => advancedFilterHandler(false)}
                className="w-9 h-9 flex items-center justify-center rounded-full transition-all"
                style={{ background: "#f3f4f6" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#ebebeb")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "#f3f4f6")
                }
              >
                <HugeiconsIcon
                  icon={Cancel01Icon}
                  size={18}
                  color="#6b7280"
                  strokeWidth={2}
                />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-8">
              {/* Text Search */}
              <div>
                <label
                  className="block text-sm font-bold mb-3"
                  style={{ color: "#222831" }}
                >
                  Search by keyword
                </label>
                <div className="relative">
                  <HugeiconsIcon
                    icon={Search01Icon}
                    size={17}
                    color="#9ca3af"
                    strokeWidth={1.5}
                    className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                  />
                  <input
                    value={searchFilter?.search?.text ?? ""}
                    type="text"
                    placeholder="What are you looking for?"
                    onChange={(e) =>
                      setSearchFilter({
                        ...searchFilter,
                        search: {
                          ...searchFilter.search,
                          text: e.target.value,
                        },
                      })
                    }
                    className="w-full pl-11 pr-4 py-3 rounded-xl text-sm focus:outline-none border transition-all"
                    style={{ borderColor: "#ebebeb", color: "#374151" }}
                    onFocus={(e) =>
                      (e.currentTarget.style.borderColor = "#F25912")
                    }
                    onBlur={(e) =>
                      (e.currentTarget.style.borderColor = "#ebebeb")
                    }
                  />
                </div>
              </div>

              {/* Bedrooms */}
              <div>
                <label
                  className="block text-sm font-bold mb-3"
                  style={{ color: "#222831" }}
                >
                  Bedrooms
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => propertyBedSelectHandler(0)}
                    className="px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all"
                    style={
                      !searchFilter?.search?.bedsList
                        ? {
                            background: "#F25912",
                            color: "#fff",
                            borderColor: "#F25912",
                          }
                        : {
                            background: "#fff",
                            color: "#6b7280",
                            borderColor: "#e5e7eb",
                          }
                    }
                  >
                    Any
                  </button>
                  {[1, 2, 3, 4, 5].map((bed) => (
                    <button
                      key={bed}
                      onClick={() => propertyBedSelectHandler(bed)}
                      className="px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all"
                      style={
                        searchFilter?.search?.bedsList?.includes(bed)
                          ? {
                              background: "#F25912",
                              color: "#fff",
                              borderColor: "#F25912",
                            }
                          : {
                              background: "#fff",
                              color: "#6b7280",
                              borderColor: "#e5e7eb",
                            }
                      }
                    >
                      {bed}
                    </button>
                  ))}
                </div>
              </div>

              {/* Options */}
              <div>
                <label
                  className="block text-sm font-bold mb-3"
                  style={{ color: "#222831" }}
                >
                  Property Options
                </label>
                <div className="flex items-center gap-2">
                  {[
                    { value: "all", label: "All" },
                    { value: "propertyBarter", label: "Barter" },
                    { value: "propertyRent", label: "Rent" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => propertyOptionSelectHandler(opt.value)}
                      className="px-5 py-2.5 rounded-xl text-sm font-semibold border transition-all"
                      style={
                        optionCheck === opt.value
                          ? {
                              background: "#222831",
                              color: "#fff",
                              borderColor: "#222831",
                            }
                          : {
                              background: "#fff",
                              color: "#6b7280",
                              borderColor: "#e5e7eb",
                            }
                      }
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Year + Square */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label
                    className="block text-sm font-bold mb-3"
                    style={{ color: "#222831" }}
                  >
                    Year Built
                  </label>
                  <div className="flex items-center gap-2">
                    <select
                      value={yearCheck.start}
                      onChange={yearStartChangeHandler}
                      className="flex-1 px-3 py-2.5 border rounded-xl text-sm focus:outline-none"
                      style={{ borderColor: "#e5e7eb", color: "#374151" }}
                    >
                      {propertyYears?.map((year: number) => (
                        <option
                          key={year}
                          value={year}
                          disabled={yearCheck.end <= year}
                        >
                          {year}
                        </option>
                      ))}
                    </select>
                    <span style={{ color: "#9ca3af" }}>—</span>
                    <select
                      value={yearCheck.end}
                      onChange={yearEndChangeHandler}
                      className="flex-1 px-3 py-2.5 border rounded-xl text-sm focus:outline-none"
                      style={{ borderColor: "#e5e7eb", color: "#374151" }}
                    >
                      {propertyYears
                        ?.slice()
                        .reverse()
                        .map((year: number) => (
                          <option
                            key={year}
                            value={year}
                            disabled={yearCheck.start >= year}
                          >
                            {year}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    className="block text-sm font-bold mb-3"
                    style={{ color: "#222831" }}
                  >
                    Square Meters (㎡)
                  </label>
                  <div className="flex items-center gap-2">
                    <select
                      value={searchFilter?.search?.squaresRange?.start}
                      onChange={(e) => propertySquareHandler(e, "start")}
                      className="flex-1 px-3 py-2.5 border rounded-xl text-sm focus:outline-none"
                      style={{ borderColor: "#e5e7eb", color: "#374151" }}
                    >
                      {propertySquare.map((sq: number) => (
                        <option
                          key={sq}
                          value={sq}
                          disabled={
                            (searchFilter?.search?.squaresRange?.end || 0) < sq
                          }
                        >
                          {sq}
                        </option>
                      ))}
                    </select>
                    <span style={{ color: "#9ca3af" }}>—</span>
                    <select
                      value={searchFilter?.search?.squaresRange?.end}
                      onChange={(e) => propertySquareHandler(e, "end")}
                      className="flex-1 px-3 py-2.5 border rounded-xl text-sm focus:outline-none"
                      style={{ borderColor: "#e5e7eb", color: "#374151" }}
                    >
                      {propertySquare.map((sq: number) => (
                        <option
                          key={sq}
                          value={sq}
                          disabled={
                            (searchFilter?.search?.squaresRange?.start || 0) >
                            sq
                          }
                        >
                          {sq}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div
              className="flex items-center justify-between p-6"
              style={{ borderTop: "1px solid #ebebeb" }}
            >
              <button
                onClick={resetFilterHandler}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border transition-all"
                style={{ borderColor: "#e5e7eb", color: "#6b7280" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor =
                    "#222831";
                  (e.currentTarget as HTMLButtonElement).style.color =
                    "#222831";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor =
                    "#e5e7eb";
                  (e.currentTarget as HTMLButtonElement).style.color =
                    "#6b7280";
                }}
              >
                <HugeiconsIcon
                  icon={FilterEditIcon}
                  size={16}
                  color="currentColor"
                  strokeWidth={1.5}
                />
                Reset all
              </button>
              <button
                onClick={pushSearchHandler}
                className="flex items-center gap-2 px-8 py-2.5 rounded-xl text-sm font-bold text-white transition-all"
                style={{
                  background: "#F25912",
                  boxShadow: "0 4px 16px rgba(242,89,18,0.3)",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                <HugeiconsIcon
                  icon={Search01Icon}
                  size={17}
                  color="white"
                  strokeWidth={2}
                />
                Search Properties
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HeaderFilter;
