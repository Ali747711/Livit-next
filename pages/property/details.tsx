import { userVar } from "@/apollo/store";
import { CREATE_COMMENT, LIKE_TARGET_PROPERTY } from "@/apollo/user/mutation";
import {
  GET_COMMENTS,
  GET_PROPERTIES,
  GET_PROPERTY,
} from "@/apollo/user/query";
import { CommentGroup } from "@/lib/enums/comment";
import { Direction, Message } from "@/lib/enums/common";
import { Comment } from "@/lib/types/comment/comment";
import {
  CommentInput,
  CommentsInquiry,
} from "@/lib/types/comment/comment.input";
import { P } from "@/lib/types/common";
import { Property } from "@/lib/types/property/property";
import { useMutation, useQuery, useReactiveVar } from "@apollo/client/react";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { ChangeEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";

import {
  ArrowLeft01Icon,
  Location01Icon,
  BedIcon,
  Home01Icon,
  SquareIcon,
  Calendar03Icon,
  FavouriteIcon,
  EyeIcon,
  ShareIcon,
  UserIcon,
  CallIcon,
  Mail01Icon,
  Award01Icon,
  Navigation03Icon,
  ImageIcon,
} from "@hugeicons/core-free-icons";
import PropertyMap from "@/components/property/PropertyMap";
import PropertyCard from "@/components/property/PropertyCard";
import { getImageUrl } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

const defaultComment = {
  page: 1,
  limit: 5,
  sort: "createdAt",
  direction: Direction.DESC,
  search: { commentRefId: "" },
};

const displayFont = "Playfair Display, Georgia, serif";

const PropertyDetails: NextPage = ({
  initialComment = defaultComment,
  ...props
}: any) => {
  const router = useRouter();
  const user = useReactiveVar(userVar);
  const [propertyId, setPropertyId] = useState<string | null>(null);
  const [property, setProperty] = useState<Property | null>(null);
  const [slideImage, setSlideImage] = useState<string>("");
  const [destinationProperties, setDestinationProperties] = useState<
    Property[]
  >([]);
  const [commentInquiry, setCommentInquiry] =
    useState<CommentsInquiry>(initialComment);
  const [propertyComments, setPropertyComments] = useState<Comment[]>([]);
  const [totalComments, setTotalComments] = useState<number>(0);
  const [insertCommentData, setInsertCommentData] = useState<CommentInput>({
    commentGroup: CommentGroup.PROPERTY,
    commentContent: "",
    commentRefId: "",
  });

  const [likeTargetProperty] = useMutation(LIKE_TARGET_PROPERTY);
  const [createComment] = useMutation(CREATE_COMMENT);

  const {
    data: PropertyData,
    loading: PropertyLoading,
    refetch: getPropertyRefetch,
  } = useQuery<any>(GET_PROPERTY, {
    fetchPolicy: "network-only",
    variables: { id: propertyId },
    skip: !propertyId,
    notifyOnNetworkStatusChange: true,
  });

  useEffect(() => {
    setProperty(PropertyData?.getProperty);
    setSlideImage(getImageUrl(PropertyData?.getProperty?.propertyImages[0]));
  }, [PropertyData]);

  const { data: PropertiesData, refetch: getPropertiesRefetch } = useQuery<any>(
    GET_PROPERTIES,
    {
      fetchPolicy: "network-only",
      variables: {
        input: {
          page: 1,
          limit: 4,
          sort: "createdAt",
          direction: Direction.DESC,
          search: {
            locationList: property?.propertyLocation
              ? [property.propertyLocation]
              : [],
          },
        },
      },
      skip: !propertyId && !property,
      notifyOnNetworkStatusChange: true,
    },
  );

  useEffect(() => {
    setDestinationProperties(PropertiesData?.getProperties?.list);
  }, [PropertiesData]);

  const {
    data: CommentData,
    loading: CommentLoading,
    refetch: getCommentRefetch,
  } = useQuery<any>(GET_COMMENTS, {
    fetchPolicy: "cache-and-network",
    variables: { input: commentInquiry },
    skip: !commentInquiry.search.commentRefId,
    notifyOnNetworkStatusChange: true,
  });

  useEffect(() => {
    setPropertyComments(CommentData?.getComments?.list);
    setTotalComments(CommentData?.getComments?.metaCounter[0]?.total);
  }, [CommentData]);

  useEffect(() => {
    if (router.query?.id) {
      setPropertyId(router.query?.id as string);
      setCommentInquiry({
        ...commentInquiry,
        search: { commentRefId: router.query?.id as string },
      });
      setInsertCommentData({
        ...insertCommentData,
        commentRefId: router.query?.id as string,
      });
    }
  }, [router]);

  useEffect(() => {
    if (commentInquiry.search.commentRefId) {
      getCommentRefetch({ input: commentInquiry });
    }
  }, [commentInquiry]);

  const changeImageHandler = (image: string) =>
    setSlideImage(getImageUrl(image));

  const likePropertyHandler = async (user: P, id: string) => {
    try {
      if (!id) return;
      if (!user._id) {
        toast.error("Please login first!");
        throw new Error("Please login first!");
      }
      await likeTargetProperty({ variables: { input: id } });
      await getPropertyRefetch({ id });
      await getPropertiesRefetch({
        input: {
          page: 1,
          limit: 4,
          sort: "createdAt",
          direction: Direction.DESC,
          search: { locationList: [property?.propertyLocation] },
        },
      });
      toast.success("Property liked!");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const commentPaginationHandler = async (
    e: ChangeEvent<unknown>,
    value: number,
  ) => {
    commentInquiry.page = value;
    setCommentInquiry({ ...commentInquiry });
  };

  const createCommentHandler = async () => {
    try {
      if (!user._id) throw new Error(Message.NOT_AUTHENTICATED);
      await createComment({ variables: { input: insertCommentData } });
      setInsertCommentData({ ...insertCommentData, commentContent: "" });
      await getCommentRefetch({ input: commentInquiry });
      toast.success("Review posted successfully!");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const formatDate = (dateString: string | Date) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const getRankStyle = (rank: number) => {
    if (rank >= 80) return { color: "#F25912", background: "#fef0e9" };
    if (rank >= 60) return { color: "#222831", background: "#f7f7f5" };
    if (rank >= 40) return { color: "#16a34a", background: "#f0fdf4" };
    return { color: "#6b7280", background: "#f7f7f5" };
  };

  const getRankLabel = (rank: number) => {
    if (rank >= 80) return "Elite Agent";
    if (rank >= 60) return "Premium Agent";
    if (rank >= 40) return "Pro Agent";
    return "Agent";
  };

  if (PropertyLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#f7f7f5" }}
      >
        <div className="text-center space-y-3">
          <div
            className="w-10 h-10 border-4 rounded-full animate-spin mx-auto"
            style={{ borderColor: "#e8e8e3", borderTopColor: "#F25912" }}
          />
          <p className="text-sm" style={{ color: "#6b7280" }}>
            Loading property details...
          </p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#f7f7f5" }}
      >
        <div className="text-center space-y-4">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
            style={{ background: "#f7f7f5", border: "1px solid #e8e8e3" }}
          >
            <HugeiconsIcon
              icon={Home01Icon}
              size={32}
              color="#9ca3af"
              strokeWidth={1.5}
            />
          </div>
          <h3 className="text-xl font-bold">Property not found</h3>
          <p className="text-sm" style={{ color: "#6b7280" }}>
            The property you're looking for doesn't exist.
          </p>
          <Button
            onClick={() => router.push("/property")}
            className="rounded-full bg-[#F25912] hover:bg-[#D94E0F] text-white border-0"
          >
            Browse Properties
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#f7f7f5" }}>
      {/* Back */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="gap-2 text-[#6b7280] hover:text-[#222831] hover:bg-[#f7f7f5] pl-0"
        >
          <HugeiconsIcon
            icon={ArrowLeft01Icon}
            size={17}
            color="currentColor"
            strokeWidth={1.5}
          />
          Back
        </Button>
      </div>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <Card className="p-0 gap-0 rounded-2xl overflow-hidden border-[#e8e8e3]">
              <div className="relative h-105 md:h-130 bg-[#f7f7f5]">
                {slideImage ? (
                  <img
                    src={slideImage}
                    alt={property.propertyTitle}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <HugeiconsIcon
                      icon={ImageIcon}
                      size={64}
                      color="#d1d5db"
                      strokeWidth={1.5}
                    />
                  </div>
                )}

                {/* Type Badge */}
                <div className="absolute top-4 left-4">
                  <span
                    className="px-4 py-1.5 text-white text-xs font-bold uppercase tracking-wide rounded-full"
                    style={{ background: "#F25912" }}
                  >
                    {property.propertyType}
                  </span>
                </div>

                {/* Actions */}
                <div className="absolute top-4 right-4 flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => likePropertyHandler(user, property._id)}
                    className="rounded-full bg-white/90 hover:bg-white shadow-md h-10 w-10"
                  >
                    <HugeiconsIcon
                      icon={FavouriteIcon}
                      size={19}
                      color={
                        property.meLiked?.[0]?.myFavorite
                          ? "#F25912"
                          : "#9ca3af"
                      }
                      fill={
                        property.meLiked?.[0]?.myFavorite ? "#F25912" : "none"
                      }
                      strokeWidth={1.5}
                    />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full bg-white/90 hover:bg-white shadow-md h-10 w-10"
                  >
                    <HugeiconsIcon
                      icon={ShareIcon}
                      size={19}
                      color="#9ca3af"
                      strokeWidth={1.5}
                    />
                  </Button>
                </div>
              </div>

              {/* Thumbnails */}
              {property.propertyImages &&
                property.propertyImages.length > 1 && (
                  <CardContent className="px-4 py-3 grid grid-cols-5 md:grid-cols-7 gap-2">
                    {property.propertyImages.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => changeImageHandler(image)}
                        className="relative h-16 rounded-xl overflow-hidden border-2 transition-all"
                        style={{
                          borderColor:
                            slideImage === getImageUrl(image)
                              ? "#F25912"
                              : "#e8e8e3",
                        }}
                      >
                        <img
                          src={getImageUrl(image)}
                          alt={`${property.propertyTitle} - ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </CardContent>
                )}
            </Card>

            {/* Details */}
            <Card className="gap-0 py-0 rounded-2xl border-[#e8e8e3]">
              <CardContent className="p-6 md:p-8 space-y-6">
                {/* Title, Address, Price */}
                <div>
                  <h1
                    className="text-3xl md:text-4xl font-bold leading-tight mb-3"
                    style={{ color: "#222831" }}
                  >
                    {property.propertyTitle}
                  </h1>
                  <div
                    className="flex items-center gap-1.5 mb-5"
                    style={{ color: "#6b7280" }}
                  >
                    <HugeiconsIcon
                      icon={Location01Icon}
                      size={17}
                      color="currentColor"
                      strokeWidth={1.5}
                    />
                    <span className="text-base">
                      {property.propertyAddress}
                    </span>
                  </div>
                  <div
                    className="text-3xl font-extrabold"
                    style={{ color: "#F25912" }}
                  >
                    ₩{property.propertyPrice?.toLocaleString()}
                  </div>
                </div>

                {/* Key Features */}
                <div
                  className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-y"
                  style={{ borderColor: "#e8e8e3" }}
                >
                  {[
                    {
                      icon: BedIcon,
                      value: property.propertyBeds,
                      label: "Bedrooms",
                    },
                    {
                      icon: Home01Icon,
                      value: property.propertyRooms,
                      label: "Rooms",
                    },
                    {
                      icon: SquareIcon,
                      value: property.propertySquare,
                      label: "㎡",
                    },
                    {
                      icon: Calendar03Icon,
                      value: new Date(property.createdAt).getFullYear(),
                      label: "Year Listed",
                    },
                  ].map(({ icon, value, label }) => (
                    <div key={label} className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <HugeiconsIcon
                          icon={icon}
                          size={22}
                          color="#F25912"
                          strokeWidth={1.5}
                        />
                      </div>
                      <div
                        className="text-2xl font-bold"
                        style={{ color: "#222831" }}
                      >
                        {value}
                      </div>
                      <div
                        className="text-xs font-bold uppercase tracking-widest mt-0.5"
                        style={{ color: "#9ca3af" }}
                      >
                        {label}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Description */}
                <div>
                  <h2
                    className="text-xl font-bold mb-3"
                    style={{ color: "#222831" }}
                  >
                    Description
                  </h2>
                  <p className="leading-relaxed" style={{ color: "#6b7280" }}>
                    {property.propertyDesc ||
                      "No description available for this property."}
                  </p>
                </div>

                {/* Location */}
                <div>
                  <h2
                    className="text-xl font-bold mb-4"
                    style={{ color: "#222831" }}
                  >
                    Location
                  </h2>
                  <div
                    className="flex items-start gap-3 p-4 rounded-xl mb-3"
                    style={{
                      background: "#f7f7f5",
                      border: "1px solid #e8e8e3",
                    }}
                  >
                    <HugeiconsIcon
                      icon={Location01Icon}
                      size={18}
                      color="#F25912"
                      strokeWidth={1.5}
                      className="shrink-0 mt-0.5"
                    />
                    <div>
                      <div className="font-medium" style={{ color: "#222831" }}>
                        {property.propertyAddress}
                      </div>
                      <div
                        className="text-sm mt-0.5"
                        style={{ color: "#6b7280" }}
                      >
                        {property.propertyLocation}
                      </div>
                    </div>
                  </div>
                  <div
                    className="relative h-75 md:h-95 rounded-2xl overflow-hidden"
                    style={{ border: "1px solid #e8e8e3" }}
                  >
                    <PropertyMap
                      address={property.propertyAddress}
                      location={property.propertyLocation}
                      propertyTitle={property.propertyTitle}
                      propertyPrice={property.propertyPrice}
                      propertyImage={getImageUrl(property.propertyImages?.[0])}
                    />
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-5 pt-2">
                  <div
                    className="flex items-center gap-1.5 text-sm"
                    style={{ color: "#9ca3af" }}
                  >
                    <HugeiconsIcon
                      icon={FavouriteIcon}
                      size={15}
                      color="#F25912"
                      fill="#F25912"
                      strokeWidth={1.5}
                    />
                    {property.propertyLikes} likes
                  </div>
                  <div
                    className="flex items-center gap-1.5 text-sm"
                    style={{ color: "#9ca3af" }}
                  >
                    <HugeiconsIcon
                      icon={EyeIcon}
                      size={15}
                      color="currentColor"
                      strokeWidth={1.5}
                    />
                    {property.propertyViews} views
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reviews */}
            <Card className="gap-0 py-0 rounded-2xl border-[#e8e8e3]">
              <CardHeader className="px-6 md:px-8 pt-6 md:pt-8 pb-0">
                <CardTitle
                  className="text-2xl font-bold"
                  style={{ color: "#222831" }}
                >
                  Reviews ({totalComments || 0})
                </CardTitle>
              </CardHeader>

              <CardContent className="px-6 md:px-8 py-6">
                {user._id && (
                  <div
                    className="mb-8 pb-8"
                    style={{ borderBottom: "1px solid #e8e8e3" }}
                  >
                    <p
                      className="text-xs font-bold uppercase tracking-widest mb-4"
                      style={{ color: "#6b7280" }}
                    >
                      Write a Review
                    </p>
                    <Textarea
                      value={insertCommentData.commentContent}
                      onChange={(e) =>
                        setInsertCommentData({
                          ...insertCommentData,
                          commentContent: e.target.value,
                        })
                      }
                      placeholder="Share your thoughts about this property..."
                      className="min-h-[110px] rounded-xl border-[#e8e8e3] bg-[#f7f7f5] text-sm resize-none focus-visible:ring-[#F25912] focus-visible:border-[#F25912] text-[#222831]"
                    />
                    <div className="flex justify-end mt-3">
                      <Button
                        onClick={createCommentHandler}
                        disabled={!insertCommentData.commentContent.trim()}
                        className="rounded-full bg-[#F25912] hover:bg-[#D94E0F] text-white border-0 gap-2"
                      >
                        <HugeiconsIcon
                          icon={Navigation03Icon}
                          size={15}
                          color="currentColor"
                          strokeWidth={1.5}
                        />
                        Post Review
                      </Button>
                    </div>
                  </div>
                )}

                {CommentLoading ? (
                  <div className="flex items-center justify-center py-10">
                    <div
                      className="w-8 h-8 border-4 rounded-full animate-spin"
                      style={{
                        borderColor: "#e8e8e3",
                        borderTopColor: "#F25912",
                      }}
                    />
                  </div>
                ) : propertyComments && propertyComments.length > 0 ? (
                  <div className="space-y-4">
                    {propertyComments.map((comment) => (
                      <div
                        key={comment._id}
                        className="rounded-xl p-5"
                        style={{
                          background: "#f7f7f5",
                          border: "1px solid #e8e8e3",
                        }}
                      >
                        <div className="flex items-start gap-4">
                          <div
                            className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 overflow-hidden"
                            style={{ background: "#e8e8e3" }}
                          >
                            {comment.memberData?.memberImage ? (
                              <img
                                src={getImageUrl(
                                  comment.memberData.memberImage,
                                )}
                                alt={comment.memberData.memberFullName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <HugeiconsIcon
                                icon={UserIcon}
                                size={22}
                                color="#9ca3af"
                                strokeWidth={1.5}
                              />
                            )}
                          </div>
                          <div className="flex-1">
                            <h4
                              className="font-semibold text-sm"
                              style={{ color: "#222831" }}
                            >
                              {comment.memberData?.memberFullName}
                            </h4>
                            <p
                              className="text-xs mb-2"
                              style={{ color: "#9ca3af" }}
                            >
                              {formatDate(comment.createdAt)}
                            </p>
                            <p
                              className="text-sm leading-relaxed"
                              style={{ color: "#6b7280" }}
                            >
                              {comment.commentContent}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <p className="text-sm" style={{ color: "#9ca3af" }}>
                      No reviews yet
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column — Agent */}
          <div className="lg:col-span-1">
            {property.memberData && (
              <Card className="gap-0 py-0 rounded-2xl border-[#e8e8e3] sticky top-24">
                <CardContent className="p-6">
                  <p
                    className="text-xs font-bold uppercase tracking-widest mb-4"
                    style={{ color: "#6b7280" }}
                  >
                    Listed By
                  </p>

                  {/* Agent Profile */}
                  <div className="flex items-center gap-3 mb-5">
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center overflow-hidden shrink-0"
                      style={{
                        background: "#f7f7f5",
                        border: "2px solid #e8e8e3",
                      }}
                    >
                      {property.memberData.memberImage ? (
                        <img
                          src={getImageUrl(property.memberData.memberImage)}
                          alt={property.memberData.memberFullName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <HugeiconsIcon
                          icon={UserIcon}
                          size={30}
                          color="#9ca3af"
                          strokeWidth={1.5}
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4
                        className="font-bold text-base"
                        style={{ color: "#222831" }}
                      >
                        {property.memberData.memberFullName}
                      </h4>
                      <p className="text-sm" style={{ color: "#9ca3af" }}>
                        @{property.memberData.memberNick}
                      </p>
                      {property.memberData.memberRank && (
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold mt-1"
                          style={getRankStyle(property.memberData.memberRank)}
                        >
                          <HugeiconsIcon
                            icon={Award01Icon}
                            size={10}
                            color="currentColor"
                            strokeWidth={2}
                          />
                          {getRankLabel(property.memberData.memberRank)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Agent Stats */}
                  <div
                    className="grid grid-cols-3 gap-3 py-4 mb-5 border-y"
                    style={{ borderColor: "#e8e8e3" }}
                  >
                    {[
                      {
                        value: property.memberData.memberProperties || 0,
                        label: "Listings",
                      },
                      {
                        value: property.memberData.memberLikes || 0,
                        label: "Likes",
                      },
                      {
                        value: property.memberData.memberViews || 0,
                        label: "Views",
                      },
                    ].map(({ value, label }) => (
                      <div key={label} className="text-center">
                        <div
                          className="text-lg font-bold"
                          style={{ color: "#222831" }}
                        >
                          {value}
                        </div>
                        <div className="text-xs" style={{ color: "#9ca3af" }}>
                          {label}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* CTA Buttons */}
                  <div className="space-y-2">
                    <Button
                      onClick={() =>
                        router.push(
                          `/member?memberId=${property?.memberData?._id}`,
                        )
                      }
                      className="w-full rounded-full bg-[#F25912] hover:bg-[#D94E0F] text-white border-0"
                    >
                      View Profile
                    </Button>
                    <Button
                      variant="outline"
                      asChild
                      className="w-full rounded-full border-[#e8e8e3] text-[#222831] hover:bg-[#f7f7f5] hover:border-[#F25912] gap-2"
                    >
                      <a href={`tel:${property.memberData.memberPhone}`}>
                        <HugeiconsIcon
                          icon={CallIcon}
                          size={15}
                          color="currentColor"
                          strokeWidth={1.5}
                        />
                        Call Agent
                      </a>
                    </Button>
                    <Button
                      variant="outline"
                      asChild
                      className="w-full rounded-full border-[#e8e8e3] text-[#222831] hover:bg-[#f7f7f5] hover:border-[#F25912] gap-2"
                    >
                      <a href="mailto:contact@agent.com">
                        <HugeiconsIcon
                          icon={Mail01Icon}
                          size={15}
                          color="currentColor"
                          strokeWidth={1.5}
                        />
                        Send Email
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Related Properties */}
        {destinationProperties && destinationProperties.length > 0 && (
          <div className="mt-16">
            <p
              className="text-xs font-bold uppercase tracking-widest mb-2"
              style={{ color: "#6b7280" }}
            >
              Similar Properties
            </p>
            <h2
              className="text-2xl font-bold mb-8"
              style={{ color: "#222831" }}
            >
              More in {property.propertyLocation}
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {destinationProperties
                .filter((p) => p._id !== property._id)
                .slice(0, 4)
                .map((relatedProperty) => (
                  <PropertyCard
                    key={relatedProperty._id}
                    property={relatedProperty}
                    onLike={(id: string) => likePropertyHandler(user, id)}
                  />
                ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default PropertyDetails;
