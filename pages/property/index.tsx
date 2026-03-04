import { LIKE_TARGET_PROPERTY } from "@/apollo/user/mutation";
import { GET_PROPERTIES } from "@/apollo/user/query";
import { Direction, Message } from "@/lib/enums/common";
import { P } from "@/lib/types/common";
import { Property } from "@/lib/types/property/property";
import { useMutation, useQuery } from "@apollo/client/react";
import { NextPage } from "next";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Search01Icon,
  ArrowDown01Icon,
  ArrowUp01Icon,
} from "@hugeicons/core-free-icons";
import Filter from "@/components/property/Filter";
import PropertyCard from "@/components/property/PropertyCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const defaultInput = {
  page: 1,
  limit: 9,
  sort: "createdAt",
  direction: "DESC",
  search: { squaresRange: { start: 0, end: 1000 } },
};

const PropertyPage: NextPage = ({
  initialInput = defaultInput,
  ...props
}: any) => {
  const router = useRouter();

  const [searchFilter, setSearchFilter] = useState<any>(
    router?.query?.input
      ? JSON.parse(router?.query?.input as string)
      : initialInput,
  );
  const [properties, setProperties] = useState<Property[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchText, setSearchText] = useState<string>("");
  const [filterSortName, setFilterSortName] = useState<string>("New");
  const [showSortMenu, setShowSortMenu] = useState<boolean>(false);

  const [likeTargetProperty] = useMutation(LIKE_TARGET_PROPERTY);
  const {
    data: PropertiesData,
    loading: getPropertiesLoading,
    refetch: getPropertiesRefetch,
  } = useQuery<any>(GET_PROPERTIES, {
    fetchPolicy: "network-only",
    variables: { input: searchFilter },
    notifyOnNetworkStatusChange: true,
  });

  useEffect(() => {
    setProperties(PropertiesData?.getProperties?.list);
    setTotal(PropertiesData?.getProperties?.metaCounter[0]?.total ?? 0);
  }, [PropertiesData]);

  useEffect(() => {
    if (router.query?.input) {
      const inputObj = JSON.parse(router.query?.input as string);
      setSearchFilter(inputObj);
      setCurrentPage(inputObj.page || 1);
    }
  }, [router.query?.input]);

  const likePropertyHandler = async (user: P, id: string) => {
    try {
      if (!id) return;
      if (!user?._id) {
        toast.error("Please login first!");
        throw new Error(Message.NOT_AUTHENTICATED);
      }
      await likeTargetProperty({ variables: { input: id } });
      await getPropertiesRefetch({ input: searchFilter });
      toast.success("Property liked!");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const sortingHandler = (sort: string, direction: string, label: string) => {
    const newFilter = { ...searchFilter, page: 1, sort, direction };
    setFilterSortName(label);
    setShowSortMenu(false);
    router.push(`/property?input=${JSON.stringify(newFilter)}`);
  };

  const searchHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    const newSearch = {
      ...searchFilter,
      page: 1,
      search: { ...searchFilter.search, text: searchText || undefined },
    };
    router.push(`/property?input=${JSON.stringify(newSearch)}`);
  };

  const loadMoreHandler = async () => {
    const newFilter = { ...searchFilter, page: currentPage + 1 };
    router.push(`/property?input=${JSON.stringify(newFilter)}`);
  };

  const sortOptions = [
    { sort: "createdAt", direction: Direction.DESC, label: "New" },
    { sort: "updatedAt", direction: Direction.DESC, label: "Updated recently" },
    { sort: "propertyViews", direction: Direction.DESC, label: "Most Viewed" },
    { sort: "propertyLikes", direction: Direction.DESC, label: "Most Liked" },
    { sort: "propertyRank", direction: Direction.DESC, label: "Top Ranked" },
    {
      sort: "propertyPrice",
      direction: Direction.DESC,
      label: "Price: High to Low",
    },
    {
      sort: "propertyPrice",
      direction: Direction.ASC,
      label: "Price: Low to High",
    },
  ];

  const totalPages = Math.ceil(total / searchFilter.limit);

  return (
    <div className="min-h-screen" style={{ background: "#f7f7f5" }}>
      {/* Header */}
      <section className="bg-white border-b border-[#e8e8e3] pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p
            className="text-xs font-bold uppercase tracking-widest mb-3"
            style={{ color: "#6b7280" }}
          >
            Property Listings
          </p>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              Find Your Dream Property
            </h1>

            {/* Search */}
            <form
              onSubmit={searchHandler}
              className="relative w-full sm:max-w-sm"
            >
              <HugeiconsIcon
                icon={Search01Icon}
                size={16}
                color="#9ca3af"
                strokeWidth={1.5}
                className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10"
              />
              <Input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search properties..."
                className="pl-9 rounded-xl border-[#e8e8e3] focus-visible:ring-[#F25912]/30 focus-visible:border-[#F25912]"
              />
            </form>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8">
            <Filter
              searchFilter={searchFilter}
              setSearchFilter={setSearchFilter}
              initialInput={initialInput}
            />

            <div className="flex-1 min-w-0">
              {/* Sort Bar */}
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm" style={{ color: "#6b7280" }}>
                  <span className="font-semibold" style={{ color: "#222831" }}>
                    {total}
                  </span>{" "}
                  properties found
                </p>

                <div className="relative">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSortMenu(!showSortMenu)}
                    className="gap-2 border-[#e8e8e3] rounded-xl text-[#222831] hover:border-[#F25912]"
                  >
                    Sort: {filterSortName}
                    <HugeiconsIcon
                      icon={showSortMenu ? ArrowUp01Icon : ArrowDown01Icon}
                      size={14}
                      color="#9ca3af"
                      strokeWidth={1.5}
                    />
                  </Button>

                  {showSortMenu && (
                    <div
                      className="absolute top-full mt-2 right-0 w-56 bg-white border border-[#e8e8e3] rounded-2xl overflow-hidden z-10"
                      style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}
                    >
                      {sortOptions.map((option, index) => (
                        <button
                          key={index}
                          onClick={() =>
                            sortingHandler(
                              option.sort,
                              option.direction,
                              option.label,
                            )
                          }
                          className="w-full text-left px-4 py-3 text-sm transition-colors"
                          style={{
                            color:
                              filterSortName === option.label
                                ? "#F25912"
                                : "#222831",
                            background:
                              filterSortName === option.label
                                ? "#fef0e9"
                                : "transparent",
                            fontWeight:
                              filterSortName === option.label ? 600 : 400,
                          }}
                          onMouseEnter={(e) => {
                            if (filterSortName !== option.label)
                              (
                                e.currentTarget as HTMLElement
                              ).style.background = "#f7f7f5";
                          }}
                          onMouseLeave={(e) => {
                            if (filterSortName !== option.label)
                              (
                                e.currentTarget as HTMLElement
                              ).style.background = "transparent";
                          }}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Grid */}
              {getPropertiesLoading && currentPage === 1 ? (
                <div className="flex items-center justify-center py-24">
                  <div className="text-center space-y-3">
                    <div
                      className="w-10 h-10 border-4 rounded-full animate-spin mx-auto"
                      style={{
                        borderColor: "#e8e8e3",
                        borderTopColor: "#F25912",
                      }}
                    />
                    <p className="text-sm" style={{ color: "#6b7280" }}>
                      Loading properties...
                    </p>
                  </div>
                </div>
              ) : properties && properties.length > 0 ? (
                <>
                  <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {properties.map((property) => (
                      <PropertyCard
                        key={property._id}
                        property={property}
                        onLike={(id: string) =>
                          likePropertyHandler({ _id: "user-id" }, id)
                        }
                        likeLoading={getPropertiesLoading}
                      />
                    ))}
                  </div>

                  <div className="mt-12 space-y-3 text-center">
                    <p className="text-sm" style={{ color: "#9ca3af" }}>
                      Showing {properties.length} of {total} properties
                      {totalPages > 1 &&
                        ` — Page ${currentPage} of ${totalPages}`}
                    </p>

                    {currentPage < totalPages && (
                      <Button
                        variant="outline"
                        onClick={loadMoreHandler}
                        disabled={getPropertiesLoading}
                        className="rounded-full px-8 border-[#e8e8e3] text-[#222831] hover:border-[#F25912] hover:shadow-md disabled:opacity-50"
                      >
                        {getPropertiesLoading
                          ? "Loading..."
                          : "Load More Properties"}
                      </Button>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center py-24">
                  <div className="text-center space-y-4">
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
                      style={{
                        background: "#f7f7f5",
                        border: "1px solid #e8e8e3",
                      }}
                    >
                      <HugeiconsIcon
                        icon={Search01Icon}
                        size={28}
                        color="#9ca3af"
                        strokeWidth={1.5}
                      />
                    </div>
                    <h3
                      className="text-xl font-bold"
                      style={{
                        color: "#222831",
                        fontFamily: "Playfair Display, Georgia, serif",
                      }}
                    >
                      No properties found
                    </h3>
                    <p className="text-sm" style={{ color: "#6b7280" }}>
                      Try adjusting your search or filters
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {showSortMenu && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowSortMenu(false)}
        />
      )}
    </div>
  );
};

export default PropertyPage;
