import { NextPage } from "next";
import AdminLayout from "@/components/layouts/AdminLayout";
import { useMutation, useReactiveVar } from "@apollo/client/react";
import { UPDATE_MEMBER } from "@/apollo/user/mutation";
import { userVar } from "@/apollo/store";
import { MemberUpdate } from "@/lib/types/member/member.update";
import { useState } from "react";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  UserIcon,
  PhoneArrowDownIcon,
  Location01Icon,
} from "@hugeicons/core-free-icons";

const Stat = ({ label, value }: { label: string; value: number | string }) => (
  <div className="bg-slate-50 rounded-xl p-4 text-center">
    <p className="text-xl font-bold text-slate-900">{value}</p>
    <p className="text-xs text-slate-500 mt-0.5">{label}</p>
  </div>
);

const AdminProfile: NextPage = () => {
  const user = useReactiveVar(userVar);

  type FormFields = Pick<
    MemberUpdate,
    | "memberNick"
    | "memberFullName"
    | "memberPhone"
    | "memberAddress"
    | "memberDesc"
    | "memberImage"
  >;

  const [form, setForm] = useState<FormFields>({
    memberNick: user.memberNick ?? "",
    memberFullName: user.memberFullName ?? "",
    memberPhone: user.memberPhone ?? "",
    memberAddress: user.memberAddress ?? "",
    memberDesc: user.memberDesc ?? "",
    memberImage: user.memberImage ?? "",
  });

  const [updateMember, { loading }] = useMutation(UPDATE_MEMBER);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Build a MemberUpdate payload — _id is required, strip empty optional strings
    const input: MemberUpdate = {
      _id: user._id,
      ...Object.fromEntries(
        Object.entries(form).filter(([, v]) => (v as string).trim() !== ""),
      ),
    };
    console.log(input);
    try {
      const { data }: any = await updateMember({ variables: { input } });
      const updated = data?.updateMember;
      if (updated) {
        // Sync reactive variable so sidebar/topbar reflect changes immediately
        userVar({ ...userVar(), ...updated });
        toast.success("Profile updated");
      }
    } catch (e: any) {
      toast.error(e?.message);
    }
  };

  return (
    <AdminLayout title="Profile">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Top card — avatar + stats */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar */}
            <div className="relative shrink-0">
              {form.memberImage ? (
                <img
                  src={`${process.env.NEXT_PUBLIC_GRAPHQL_URL_IMG}${user.memberImage}`}
                  alt={user.memberNick}
                  className="w-24 h-24 rounded-2xl object-cover bg-slate-100 ring-4 ring-slate-100"
                />
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-slate-100 ring-4 ring-slate-100 flex items-center justify-center">
                  <HugeiconsIcon
                    icon={UserIcon}
                    size={36}
                    color="#94a3b8"
                    strokeWidth={1.5}
                  />
                </div>
              )}
              <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full ring-2 ring-white" />
            </div>

            {/* Name + badges */}
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-xl font-bold text-slate-900">
                {user.memberFullName || user.memberNick}
              </h2>
              <p className="text-slate-500 text-sm mt-0.5">
                @{user.memberNick}
              </p>
              <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                  {user.memberType}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                  {user.memberStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mt-6 pt-6 border-t border-slate-100">
            <Stat label="Properties" value={user.memberProperties ?? 0} />
            <Stat label="Articles" value={user.memberArticles ?? 0} />
            <Stat label="Points" value={user.memberPoints ?? 0} />
            <Stat label="Likes" value={user.memberLikes ?? 0} />
            <Stat label="Views" value={user.memberViews ?? 0} />
            <Stat label="Rank" value={user.memberRank ?? 0} />
          </div>
        </div>

        {/* Edit form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5"
        >
          <h3 className="text-base font-semibold text-slate-900">
            Edit Profile
          </h3>

          {/* Avatar URL */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Profile Image URL
            </label>
            <div className="relative">
              <HugeiconsIcon
                icon={UserIcon}
                size={15}
                color="#94a3b8"
                strokeWidth={1.5}
                className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              />
              <input
                name="memberImage"
                type="text"
                value={form.memberImage}
                onChange={handleChange}
                placeholder="https://..."
                className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F25912]/40"
              />
            </div>
          </div>

          {/* Two-column fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Nick name
              </label>
              <input
                name="memberNick"
                type="text"
                value={form.memberNick}
                onChange={handleChange}
                placeholder="e.g. pedro_admin"
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F25912]/40"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Full name
              </label>
              <input
                name="memberFullName"
                type="text"
                value={form.memberFullName}
                onChange={handleChange}
                placeholder="e.g. Pedro Gonçalves"
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F25912]/40"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Phone
              </label>
              <div className="relative">
                <HugeiconsIcon
                  icon={PhoneArrowDownIcon}
                  size={15}
                  color="#94a3b8"
                  strokeWidth={1.5}
                  className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                />
                <input
                  name="memberPhone"
                  type="text"
                  value={form.memberPhone}
                  onChange={handleChange}
                  placeholder="+82 10-0000-0000"
                  className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F25912]/40"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Address
              </label>
              <div className="relative">
                <HugeiconsIcon
                  icon={Location01Icon}
                  size={15}
                  color="#94a3b8"
                  strokeWidth={1.5}
                  className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                />
                <input
                  name="memberAddress"
                  type="text"
                  value={form.memberAddress}
                  onChange={handleChange}
                  placeholder="Seoul, South Korea"
                  className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F25912]/40"
                />
              </div>
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Bio
            </label>
            <textarea
              name="memberDesc"
              rows={4}
              value={form.memberDesc}
              onChange={handleChange}
              placeholder="Write something about yourself..."
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F25912]/40 resize-none"
            />
          </div>

          {/* Submit */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-[#F25912] text-white text-sm font-medium rounded-xl hover:bg-[#D94E0F] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>

        {/* Read-only account info */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-base font-semibold text-slate-900 mb-4">
            Account Info
          </h3>
          <div className="space-y-3 text-sm">
            {[
              { label: "Account ID", value: user._id },
              { label: "Auth type", value: user.memberAuthType },
              {
                label: "Member since",
                value: user.createdAt
                  ? new Date(user.createdAt).toLocaleString()
                  : "—",
              },
              {
                label: "Last updated",
                value: user.updatedAt
                  ? new Date(user.updatedAt).toLocaleString()
                  : "—",
              },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="flex flex-col sm:flex-row sm:justify-between gap-1"
              >
                <span className="text-slate-500 shrink-0">{label}</span>
                <span className="font-mono text-slate-700 text-xs break-all">
                  {value ?? "—"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminProfile;
