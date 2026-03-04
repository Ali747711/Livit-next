import React, { useCallback, useEffect, useState } from "react";
import { NextPage } from "next";
import { useMutation, useReactiveVar } from "@apollo/client/react";
import axios from "axios";
import { toast } from "sonner";
import { userVar } from "@/apollo/store";
import { UPDATE_MEMBER } from "@/apollo/user/mutation";
import { getJwtToken, updateStorage, updateUserinfo } from "@/lib/auth";
import { Messages } from "@/lib/config";
import { getImageUrl } from "@/lib/utils";
import { MemberUpdate } from "@/lib/types/member/member.update";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  UserIcon,
  CallIcon,
  Location01Icon,
  ImageUploadIcon,
  Tick02Icon,
  PencilEdit01Icon,
  Cancel01Icon,
  Calendar01Icon,
  Award01Icon,
} from "@hugeicons/core-free-icons";

const defaultValues: MemberUpdate = {
  _id: "",
  memberImage: "",
  memberNick: "",
  memberPhone: "",
  memberAddress: "",
  memberDesc: "",
};

const fieldStyle: React.CSSProperties = {
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

const ReadonlyRow = ({
  icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string | undefined;
}) => (
  <div
    className="flex items-start gap-3 p-4 rounded-xl"
    style={{ background: "#f9fafb", border: "1px solid #f3f4f6" }}
  >
    <div
      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
      style={{ background: "#fff3ee" }}
    >
      <HugeiconsIcon icon={icon} size={15} color="#F25912" strokeWidth={1.5} />
    </div>
    <div className="min-w-0">
      <p
        className="text-[10px] font-bold uppercase tracking-wide mb-0.5"
        style={{ color: "#9ca3af" }}
      >
        {label}
      </p>
      <p
        className="text-sm font-semibold"
        style={{ color: value ? "#222831" : "#d1d5db" }}
      >
        {value || "Not set"}
      </p>
    </div>
  </div>
);

const MyProfile: NextPage = ({ initialValues = defaultValues }: any) => {
  const token = getJwtToken();
  const user = useReactiveVar(userVar);

  const [updateData, setUpdateData] = useState<MemberUpdate>(initialValues);
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const [updateMember, { loading: updating }] = useMutation(UPDATE_MEMBER);

  useEffect(() => {
    if (user) {
      setUpdateData({
        _id: user._id || "",
        memberNick: user.memberNick || "",
        memberPhone: user.memberPhone || "",
        memberAddress: user.memberAddress || "",
        memberImage: user.memberImage || "",
        memberDesc: user.memberDesc || "",
      });
    }
  }, [user]);

  const set = (key: keyof MemberUpdate, value: string) =>
    setUpdateData((p) => ({ ...p, [key]: value }));

  const uploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      console.log("File: ", file);
      if (!file) return;
      if (!["image/jpeg", "image/jpg", "image/png"].includes(file.type)) {
        toast.error("JPG or PNG only");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Max 5MB");
        return;
      }
      setUploading(true);

      const formData = new FormData();
      formData.append(
        "operations",
        JSON.stringify({
          query: `mutation ImageUploader($file: Upload!, $target: String!) { imageUploader(file: $file, target: $target) }`,
          variables: { file: null, target: "member" },
        }),
      );
      formData.append("map", JSON.stringify({ "0": ["variables.file"] }));
      formData.append("0", file);

      const response: any = await axios.post(
        process.env.NEXT_PUBLIC_GRAPHQL_URL || "",
        formData,
        {
          headers: {
            "apollo-require-preflight": "true",
            Authorization: `Bearer ${token}`,
          },
        },
      );
      console.log("Response: ", response);
      set("memberImage", response.data.data.imageUploader);
      toast.success("Photo updated");
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const validateForm = () => {
    const errors: string[] = [];
    if (!updateData.memberNick?.trim()) errors.push("Username is required");
    if (!updateData.memberPhone?.trim())
      errors.push("Phone number is required");
    if (!updateData.memberAddress?.trim()) errors.push("Address is required");
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const updateProfileHandler = useCallback(async () => {
    if (!validateForm()) {
      toast.error("Please fix the errors");
      return;
    }
    try {
      if (!user._id) throw new Error(Messages.error2);
      const result: any = await updateMember({
        variables: { input: { ...updateData, _id: user._id } },
      });
      const jwtToken = result.data.updateMember?.accessToken;
      if (jwtToken) {
        await updateStorage({ jwtToken });
        updateUserinfo(jwtToken);
      }
      setEditing(false);
      toast.success("Profile updated!");
    } catch (err: any) {
      toast.error(err.message || "Failed to update");
    }
  }, [updateData, user]);

  const cancelEditing = () => {
    setEditing(false);
    setValidationErrors([]);
    if (user) {
      setUpdateData({
        _id: user._id || "",
        memberNick: user.memberNick || "",
        memberPhone: user.memberPhone || "",
        memberAddress: user.memberAddress || "",
        memberImage: user.memberImage || "",
        memberDesc: user.memberDesc || "",
      });
    }
  };

  const isFormValid = () =>
    updateData.memberNick?.trim() &&
    updateData.memberPhone?.trim() &&
    updateData.memberAddress?.trim();

  const avatarUrl = getImageUrl(updateData.memberImage);

  const getRankLabel = (type?: string) => {
    if (type === "ADMIN") return "Administrator";
    if (type === "AGENT") return "Agent";
    return "Member";
  };

  return (
    <div className="space-y-5">
      {/* ── Header card ─────────────────────────────────────────────── */}
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
                Account
              </span>
            </div>
            <h1 className="text-xl font-extrabold" style={{ color: "#222831" }}>
              My Profile
            </h1>
          </div>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold text-white transition-all"
              style={{
                background: "#F25912",
                boxShadow: "0 4px 14px rgba(242,89,18,0.28)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              <HugeiconsIcon
                icon={PencilEdit01Icon}
                size={14}
                color="white"
                strokeWidth={2.5}
              />
              Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* ── Validation errors ────────────────────────────────────────── */}
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

      {/* ── Avatar + account info ────────────────────────────────────── */}
      <div
        className="rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5"
        style={{ background: "#fff", border: "1px solid #ebebeb" }}
      >
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div
            className="w-24 h-24 rounded-full overflow-hidden"
            style={{ border: "3px solid #fff3ee" }}
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src="/img/profiles/avatardef.png"
                alt="Profile"
                className="w-full h-full object-cover"
              />
            )}
          </div>
          {uploading && (
            <div
              className="absolute inset-0 rounded-full flex items-center justify-center"
              style={{ background: "rgba(0,0,0,0.5)" }}
            >
              <span className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          {/* Active dot */}
          <span
            className="absolute bottom-0.5 right-0.5 w-4 h-4 rounded-full border-2 border-white"
            style={{ background: "#22c55e" }}
          />
        </div>

        {/* Name / type */}
        <div className="flex-1 min-w-0">
          <h2
            className="text-lg font-extrabold truncate"
            style={{ color: "#222831" }}
          >
            {user.memberNick || "—"}
          </h2>
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide"
            style={{ background: "#fff3ee", color: "#F25912" }}
          >
            <HugeiconsIcon
              icon={Award01Icon}
              size={10}
              color="#F25912"
              strokeWidth={2.5}
            />
            {getRankLabel(user.memberType)}
          </span>
          {user.memberAddress && (
            <p
              className="flex items-center gap-1 mt-2 text-xs"
              style={{ color: "#9ca3af" }}
            >
              <HugeiconsIcon
                icon={Location01Icon}
                size={12}
                color="#9ca3af"
                strokeWidth={1.5}
              />
              {user.memberAddress}
            </p>
          )}
        </div>

        {/* Upload photo (edit mode) */}
        {editing && (
          <div>
            <input
              type="file"
              id="profile-image"
              hidden
              onChange={uploadImage}
              accept="image/jpg,image/jpeg,image/png"
              disabled={uploading}
            />
            <label
              htmlFor="profile-image"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold cursor-pointer border transition-all"
              style={{ borderColor: "#ebebeb", color: "#374151" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLLabelElement).style.borderColor =
                  "#F25912";
                (e.currentTarget as HTMLLabelElement).style.color = "#F25912";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLLabelElement).style.borderColor =
                  "#ebebeb";
                (e.currentTarget as HTMLLabelElement).style.color = "#374151";
              }}
            >
              <HugeiconsIcon
                icon={ImageUploadIcon}
                size={15}
                color="currentColor"
                strokeWidth={1.5}
              />
              {uploading ? "Uploading…" : "Change Photo"}
            </label>
            <p
              className="text-[10px] mt-1.5 text-center"
              style={{ color: "#9ca3af" }}
            >
              JPG / PNG · Max 5MB
            </p>
          </div>
        )}
      </div>

      {/* ── Personal Information ─────────────────────────────────────── */}
      <div
        className="rounded-2xl p-6"
        style={{ background: "#fff", border: "1px solid #ebebeb" }}
      >
        <div className="flex items-center gap-2 mb-4">
          <div
            className="h-[2px] w-4 rounded"
            style={{ background: "#F25912" }}
          />
          <span
            className="text-[11px] font-bold uppercase tracking-[0.16em]"
            style={{ color: "#F25912" }}
          >
            Personal Information
          </span>
        </div>

        {editing ? (
          /* ── Edit mode ── */
          <div className="space-y-4">
            {[
              {
                icon: UserIcon,
                label: "Username *",
                key: "memberNick" as const,
                type: "text",
                placeholder: "Your display name",
              },
              {
                icon: CallIcon,
                label: "Phone Number *",
                key: "memberPhone" as const,
                type: "tel",
                placeholder: "+82 10-1234-5678",
              },
              {
                icon: Location01Icon,
                label: "Address *",
                key: "memberAddress" as const,
                type: "text",
                placeholder: "123 Gangnam-daero, Seoul",
              },
            ].map(({ icon, label, key, type, placeholder }) => (
              <div key={key}>
                <label
                  className="flex items-center gap-1.5 text-sm font-bold mb-1.5"
                  style={{ color: "#374151" }}
                >
                  <HugeiconsIcon
                    icon={icon}
                    size={14}
                    color="#9ca3af"
                    strokeWidth={1.5}
                  />
                  {label}
                </label>
                <input
                  type={type}
                  value={(updateData[key] as string) || ""}
                  onChange={(e) => set(key, e.target.value)}
                  placeholder={placeholder}
                  style={fieldStyle}
                  onFocus={(e) =>
                    (e.currentTarget.style.borderColor = "#F25912")
                  }
                  onBlur={(e) =>
                    (e.currentTarget.style.borderColor = "#ebebeb")
                  }
                />
              </div>
            ))}

            {/* Bio */}
            <div>
              <label
                className="block text-sm font-bold mb-1.5"
                style={{ color: "#374151" }}
              >
                Bio{" "}
                <span className="font-medium" style={{ color: "#9ca3af" }}>
                  (optional)
                </span>
              </label>
              <textarea
                value={updateData.memberDesc || ""}
                onChange={(e) => set("memberDesc", e.target.value)}
                rows={4}
                placeholder="Tell us about yourself…"
                style={{ ...fieldStyle, resize: "none" }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#F25912")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#ebebeb")}
              />
            </div>
          </div>
        ) : (
          /* ── Read-only mode ── */
          <div className="space-y-3">
            <ReadonlyRow
              icon={UserIcon}
              label="Username"
              value={user.memberNick}
            />
            <ReadonlyRow
              icon={CallIcon}
              label="Phone"
              value={user.memberPhone}
            />
            <ReadonlyRow
              icon={Location01Icon}
              label="Address"
              value={user.memberAddress}
            />
            {user.memberDesc && (
              <div
                className="p-4 rounded-xl"
                style={{ background: "#f9fafb", border: "1px solid #f3f4f6" }}
              >
                <p
                  className="text-[10px] font-bold uppercase tracking-wide mb-1"
                  style={{ color: "#9ca3af" }}
                >
                  Bio
                </p>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "#374151" }}
                >
                  {user.memberDesc}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Account Information (read-only) ─────────────────────────── */}
      <div
        className="rounded-2xl p-6"
        style={{ background: "#fff", border: "1px solid #ebebeb" }}
      >
        <div className="flex items-center gap-2 mb-4">
          <div
            className="h-[2px] w-4 rounded"
            style={{ background: "#F25912" }}
          />
          <span
            className="text-[11px] font-bold uppercase tracking-[0.16em]"
            style={{ color: "#F25912" }}
          >
            Account Information
          </span>
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          <div
            className="flex items-center gap-3 p-4 rounded-xl"
            style={{ background: "#f9fafb", border: "1px solid #f3f4f6" }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: "#fff3ee" }}
            >
              <HugeiconsIcon
                icon={Award01Icon}
                size={15}
                color="#F25912"
                strokeWidth={1.5}
              />
            </div>
            <div>
              <p
                className="text-[10px] font-bold uppercase tracking-wide"
                style={{ color: "#9ca3af" }}
              >
                Member Type
              </p>
              <p className="text-sm font-bold" style={{ color: "#222831" }}>
                {getRankLabel(user.memberType)}
              </p>
            </div>
          </div>

          <div
            className="flex items-center gap-3 p-4 rounded-xl"
            style={{ background: "#f9fafb", border: "1px solid #f3f4f6" }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: "#fff3ee" }}
            >
              <HugeiconsIcon
                icon={Calendar01Icon}
                size={15}
                color="#F25912"
                strokeWidth={1.5}
              />
            </div>
            <div>
              <p
                className="text-[10px] font-bold uppercase tracking-wide"
                style={{ color: "#9ca3af" }}
              >
                Member Since
              </p>
              <p className="text-sm font-bold" style={{ color: "#222831" }}>
                {user.createdAt
                  ? new Date(user.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })
                  : "—"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Edit mode actions ────────────────────────────────────────── */}
      {editing && (
        <div className="flex gap-3">
          <button
            onClick={cancelEditing}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold border transition-all"
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
            <HugeiconsIcon
              icon={Cancel01Icon}
              size={15}
              color="currentColor"
              strokeWidth={2}
            />
            Cancel
          </button>
          <button
            onClick={updateProfileHandler}
            disabled={!isFormValid() || updating || uploading}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white disabled:opacity-40 transition-all"
            style={{
              background: "#F25912",
              boxShadow: "0 4px 14px rgba(242,89,18,0.28)",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            {updating ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <HugeiconsIcon
                icon={Tick02Icon}
                size={15}
                color="white"
                strokeWidth={2.5}
              />
            )}
            {updating ? "Saving…" : "Save Changes"}
          </button>
        </div>
      )}
    </div>
  );
};

// Local helper to avoid import collision
function getRankLabel(type?: string) {
  if (type === "ADMIN") return "Administrator";
  if (type === "AGENT") return "Agent";
  return "Member";
}

export default MyProfile;
