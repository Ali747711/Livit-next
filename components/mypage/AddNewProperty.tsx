import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { toast } from "sonner";
import { userVar } from "@/apollo/store";
import { CREATE_PROPERTY, UPDATE_PROPERTY } from "@/apollo/user/mutation";
import { GET_PROPERTY } from "@/apollo/user/query";
import { getJwtToken } from "@/lib/auth";
import { PropertyLocation, PropertyType } from "@/lib/enums/property";
import { PropertyInput } from "@/lib/types/property/property.input";
import { propertySquare } from "@/lib/config";
import { getImageUrl } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ImageUploadIcon,
  Cancel01Icon,
  Tick02Icon,
  ArrowLeft01Icon,
} from "@hugeicons/core-free-icons";
import { useMutation, useQuery, useReactiveVar } from "@apollo/client/react";

const defaultValues: PropertyInput = {
  propertyTitle: "",
  propertyPrice: 0,
  propertyType: PropertyType.APARTMENT,
  propertyLocation: PropertyLocation.SEOUL,
  propertyAddress: "",
  propertyBarter: false,
  propertyRent: false,
  propertyRooms: 1,
  propertyBeds: 1,
  propertySquare: 50,
  propertyDesc: "",
  propertyImages: [],
};

// ── Reusable field components ─────────────────────────────────────────────────
const fieldStyle = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: "10px",
  border: "1px solid #ebebeb",
  fontSize: "14px",
  color: "#374151",
  background: "#fff",
  outline: "none",
  transition: "border-color 0.2s",
};

const Label = ({ children }: { children: React.ReactNode }) => (
  <label
    className="block text-sm font-semibold mb-1.5"
    style={{ color: "#374151" }}
  >
    {children}
  </label>
);

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center gap-2 mb-5">
    <div className="h-[2px] w-4 rounded" style={{ background: "#F25912" }} />
    <h2
      className="text-sm font-extrabold uppercase tracking-[0.12em]"
      style={{ color: "#F25912" }}
    >
      {children}
    </h2>
  </div>
);

const CreateProperty = ({ initialValues = defaultValues }: any) => {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const user = useReactiveVar(userVar);
  const token = getJwtToken();
  const [insertPropertyData, setInsertPropertyData] =
    useState<PropertyInput>(initialValues);
  const [uploading, setUploading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const isEditMode = !!router.query.propertyId;

  const [createProperty, { loading: creating }] = useMutation(CREATE_PROPERTY);
  const [updateProperty, { loading: updating }] = useMutation(UPDATE_PROPERTY);

  const { loading: getPropertyLoading, data: getPropertyData } = useQuery<any>(
    GET_PROPERTY,
    {
      fetchPolicy: "network-only",
      variables: { input: router.query.propertyId },
      skip: !router.query.propertyId,
    },
  );

  useEffect(() => {
    if (getPropertyData?.getProperty) {
      const p = getPropertyData.getProperty;
      setInsertPropertyData({
        propertyTitle: p.propertyTitle || "",
        propertyPrice: p.propertyPrice || 0,
        propertyType: p.propertyType || PropertyType.APARTMENT,
        propertyLocation: p.propertyLocation || PropertyLocation.SEOUL,
        propertyAddress: p.propertyAddress || "",
        propertyBarter: p.propertyBarter || false,
        propertyRent: p.propertyRent || false,
        propertyRooms: p.propertyRooms || 1,
        propertyBeds: p.propertyBeds || 1,
        propertySquare: p.propertySquare || 50,
        propertyDesc: p.propertyDesc || "",
        propertyImages: p.propertyImages || [],
      });
    }
  }, [getPropertyData]);

  useEffect(() => {
    if (user && user.memberType !== "AGENT") {
      toast.error("Only agents can create properties");
      router.back();
    }
  }, [user]);

  const set = (key: keyof PropertyInput, value: any) =>
    setInsertPropertyData((p) => ({ ...p, [key]: value }));

  const uploadImages = async () => {
    try {
      if (!inputRef.current?.files) return;
      const files = inputRef.current.files;
      if (!files.length) return;
      if (files.length > 5) {
        toast.error("Max 5 images");
        return;
      }
      setUploading(true);

      const formData = new FormData();
      formData.append(
        "operations",
        JSON.stringify({
          query: `mutation ImagesUploader($files: [Upload!]!, $target: String!) { imagesUploader(files: $files, target: $target) }`,
          variables: {
            files: Array(files.length).fill(null),
            target: "property",
          },
        }),
      );
      const map: any = {};
      for (let i = 0; i < files.length; i++) map[i] = [`variables.files.${i}`];
      formData.append("map", JSON.stringify(map));
      for (let i = 0; i < files.length; i++)
        formData.append(String(i), files[i]);

      const res: any = await axios.post(
        process.env.NEXT_PUBLIC_GRAPHQL_URL || "",
        formData,
        {
          headers: {
            "apollo-require-preflight": "true",
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const uploaded = res.data.data.imagesUploader;
      set("propertyImages", [
        ...insertPropertyData.propertyImages,
        ...uploaded,
      ]);
      toast.success(`${uploaded.length} images uploaded`);
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (i: number) => {
    set(
      "propertyImages",
      insertPropertyData.propertyImages.filter((_, idx) => idx !== i),
    );
  };

  const validateForm = () => {
    const errors: string[] = [];
    if (!insertPropertyData.propertyTitle.trim())
      errors.push("Title is required");
    if (insertPropertyData.propertyPrice <= 0) errors.push("Price must be > 0");
    if (!insertPropertyData.propertyAddress.trim())
      errors.push("Address is required");
    if (insertPropertyData.propertyImages.length === 0)
      errors.push("At least 1 image required");
    if (!insertPropertyData.propertyDesc?.trim())
      errors.push("Description is required");
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const insertPropertyHandler = useCallback(async () => {
    if (!validateForm()) {
      toast.error("Please fix the errors");
      return;
    }
    try {
      await createProperty({ variables: { input: insertPropertyData } });
      toast.success("Property created!");
      router.push({ pathname: "/mypage", query: { category: "myProperties" } });
    } catch (err: any) {
      toast.error(err.message || "Failed to create");
    }
  }, [insertPropertyData]);

  const updatePropertyHandler = useCallback(async () => {
    if (!validateForm()) {
      toast.error("Please fix the errors");
      return;
    }
    try {
      await updateProperty({
        variables: {
          input: {
            ...insertPropertyData,
            _id: getPropertyData?.getProperty?._id,
          },
        },
      });
      toast.success("Property updated!");
      router.push({ pathname: "/mypage", query: { category: "myProperties" } });
    } catch (err: any) {
      toast.error(err.message || "Failed to update");
    }
  }, [insertPropertyData, getPropertyData]);

  if (getPropertyLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div
          className="w-9 h-9 rounded-full border-2 animate-spin"
          style={{ borderColor: "#F25912", borderTopColor: "transparent" }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header card */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: "#fff", border: "1px solid #ebebeb" }}
      >
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
                {isEditMode ? "Edit Listing" : "New Listing"}
              </span>
            </div>
            <h1 className="text-xl font-extrabold" style={{ color: "#222831" }}>
              {isEditMode ? "Edit Property" : "Add New Property"}
            </h1>
          </div>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-sm font-semibold transition-colors"
            style={{ color: "#9ca3af" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#F25912")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#9ca3af")}
          >
            <HugeiconsIcon
              icon={ArrowLeft01Icon}
              size={15}
              color="currentColor"
              strokeWidth={2.5}
            />
            Back
          </button>
        </div>
      </div>

      {/* Validation errors */}
      {validationErrors.length > 0 && (
        <div
          className="rounded-xl p-4"
          style={{ background: "#fef2f2", border: "1px solid #fecaca" }}
        >
          <p className="text-sm font-bold text-red-700 mb-2">
            Please fix the following:
          </p>
          <ul className="space-y-1">
            {validationErrors.map((e, i) => (
              <li
                key={i}
                className="text-xs text-red-600 flex items-center gap-2"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                {e}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Form card */}
      <div
        className="rounded-2xl p-7 space-y-8"
        style={{ background: "#fff", border: "1px solid #ebebeb" }}
      >
        {/* Basic info */}
        <section>
          <SectionTitle>Basic Information</SectionTitle>
          <div className="space-y-4">
            <div>
              <Label>Property Title *</Label>
              <input
                type="text"
                value={insertPropertyData.propertyTitle}
                onChange={(e) => set("propertyTitle", e.target.value)}
                placeholder="Beautiful Modern Apartment in Gangnam"
                style={fieldStyle}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#F25912")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#ebebeb")}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Price (₩) *</Label>
                <input
                  type="number"
                  value={insertPropertyData.propertyPrice}
                  onChange={(e) =>
                    set("propertyPrice", parseInt(e.target.value) || 0)
                  }
                  placeholder="500000000"
                  style={fieldStyle}
                  onFocus={(e) =>
                    (e.currentTarget.style.borderColor = "#F25912")
                  }
                  onBlur={(e) =>
                    (e.currentTarget.style.borderColor = "#ebebeb")
                  }
                />
              </div>
              <div>
                <Label>Property Type *</Label>
                <select
                  value={insertPropertyData.propertyType}
                  onChange={(e) =>
                    set("propertyType", e.target.value as PropertyType)
                  }
                  style={fieldStyle}
                  onFocus={(e) =>
                    (e.currentTarget.style.borderColor = "#F25912")
                  }
                  onBlur={(e) =>
                    (e.currentTarget.style.borderColor = "#ebebeb")
                  }
                >
                  {Object.values(PropertyType).map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Location *</Label>
                <select
                  value={insertPropertyData.propertyLocation}
                  onChange={(e) =>
                    set("propertyLocation", e.target.value as PropertyLocation)
                  }
                  style={fieldStyle}
                  onFocus={(e) =>
                    (e.currentTarget.style.borderColor = "#F25912")
                  }
                  onBlur={(e) =>
                    (e.currentTarget.style.borderColor = "#ebebeb")
                  }
                >
                  {Object.values(PropertyLocation).map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Address *</Label>
                <input
                  type="text"
                  value={insertPropertyData.propertyAddress}
                  onChange={(e) => set("propertyAddress", e.target.value)}
                  placeholder="123 Gangnam-daero, Gangnam-gu"
                  style={fieldStyle}
                  onFocus={(e) =>
                    (e.currentTarget.style.borderColor = "#F25912")
                  }
                  onBlur={(e) =>
                    (e.currentTarget.style.borderColor = "#ebebeb")
                  }
                />
              </div>
            </div>

            {/* Toggles */}
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { label: "Accept Barter?", key: "propertyBarter" as const },
                { label: "Available for Rent?", key: "propertyRent" as const },
              ].map(({ label, key }) => (
                <div key={key}>
                  <Label>{label}</Label>
                  <select
                    value={insertPropertyData[key] ? "yes" : "no"}
                    onChange={(e) => set(key, e.target.value === "yes")}
                    style={fieldStyle}
                    onFocus={(e) =>
                      (e.currentTarget.style.borderColor = "#F25912")
                    }
                    onBlur={(e) =>
                      (e.currentTarget.style.borderColor = "#ebebeb")
                    }
                  >
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Property details */}
        <section style={{ borderTop: "1px solid #f3f4f6", paddingTop: "28px" }}>
          <SectionTitle>Property Details</SectionTitle>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label>Rooms *</Label>
              <select
                value={insertPropertyData.propertyRooms}
                onChange={(e) => set("propertyRooms", parseInt(e.target.value))}
                style={fieldStyle}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#F25912")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#ebebeb")}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                  <option key={n} value={n}>
                    {n} {n === 1 ? "Room" : "Rooms"}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Bedrooms *</Label>
              <select
                value={insertPropertyData.propertyBeds}
                onChange={(e) => set("propertyBeds", parseInt(e.target.value))}
                style={fieldStyle}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#F25912")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#ebebeb")}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                  <option key={n} value={n}>
                    {n} {n === 1 ? "Bedroom" : "Bedrooms"}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Square (㎡) *</Label>
              <select
                value={insertPropertyData.propertySquare}
                onChange={(e) =>
                  set("propertySquare", parseInt(e.target.value))
                }
                style={fieldStyle}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#F25912")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#ebebeb")}
              >
                {propertySquare
                  ?.filter((s) => s > 0)
                  .map((s) => (
                    <option key={s} value={s}>
                      {s}㎡
                    </option>
                  ))}
              </select>
            </div>
          </div>
        </section>

        {/* Description */}
        <section style={{ borderTop: "1px solid #f3f4f6", paddingTop: "28px" }}>
          <SectionTitle>Description</SectionTitle>
          <textarea
            value={insertPropertyData.propertyDesc}
            onChange={(e) => set("propertyDesc", e.target.value)}
            rows={5}
            placeholder="Describe your property in detail…"
            style={{ ...fieldStyle, resize: "none" }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "#F25912")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "#ebebeb")}
          />
        </section>

        {/* Images */}
        <section style={{ borderTop: "1px solid #f3f4f6", paddingTop: "28px" }}>
          <SectionTitle>Property Images *</SectionTitle>

          {/* Upload dropzone */}
          <div
            onClick={() => inputRef.current?.click()}
            className="rounded-xl p-8 text-center cursor-pointer transition-all"
            style={{ border: "2px dashed #ebebeb" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.borderColor = "#F25912")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.borderColor = "#ebebeb")
            }
          >
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-3"
              style={{ background: "#fff3ee" }}
            >
              <HugeiconsIcon
                icon={ImageUploadIcon}
                size={28}
                color="#F25912"
                strokeWidth={1.5}
              />
            </div>
            <p className="text-sm font-bold mb-1" style={{ color: "#222831" }}>
              {uploading ? "Uploading…" : "Upload Property Images"}
            </p>
            <p className="text-xs" style={{ color: "#9ca3af" }}>
              Click to browse · Max 5 images · JPG / PNG
            </p>
            <input
              ref={inputRef}
              type="file"
              hidden
              onChange={uploadImages}
              multiple
              accept="image/jpg,image/jpeg,image/png"
              disabled={uploading}
            />
          </div>

          {/* Image gallery */}
          {insertPropertyData.propertyImages.length > 0 && (
            <div className="mt-4 grid grid-cols-3 md:grid-cols-5 gap-3">
              {insertPropertyData.propertyImages.map((img, i) => (
                <div
                  key={i}
                  className="relative rounded-xl overflow-hidden group aspect-square"
                >
                  <img
                    src={getImageUrl(img)}
                    alt={`img-${i}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => removeImage(i)}
                    className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                    style={{ background: "#ef4444" }}
                  >
                    <HugeiconsIcon
                      icon={Cancel01Icon}
                      size={13}
                      color="white"
                      strokeWidth={2.5}
                    />
                  </button>
                  {i === 0 && (
                    <span
                      className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold text-white"
                      style={{ background: "#F25912" }}
                    >
                      Cover
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Buttons */}
        <div
          className="flex gap-3 pt-2"
          style={{ borderTop: "1px solid #f3f4f6" }}
        >
          <button
            onClick={() => router.back()}
            className="flex-1 py-3 rounded-xl text-sm font-bold border transition-all"
            style={{ borderColor: "#ebebeb", color: "#374151" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor =
                "#222831";
              (e.currentTarget as HTMLButtonElement).style.color = "#222831";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor =
                "#ebebeb";
              (e.currentTarget as HTMLButtonElement).style.color = "#374151";
            }}
          >
            Cancel
          </button>
          <button
            onClick={isEditMode ? updatePropertyHandler : insertPropertyHandler}
            disabled={creating || updating || uploading}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white disabled:opacity-50 transition-all"
            style={{
              background: "#F25912",
              boxShadow: "0 4px 14px rgba(242,89,18,0.28)",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            {creating || updating ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <HugeiconsIcon
                icon={Tick02Icon}
                size={17}
                color="white"
                strokeWidth={2.5}
              />
            )}
            {creating || updating
              ? isEditMode
                ? "Updating…"
                : "Creating…"
              : isEditMode
                ? "Update Property"
                : "Create Property"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateProperty;
