import React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Home01Icon,
  Search01Icon,
  ArrowLeft01Icon,
  MapPinIcon,
} from "@hugeicons/core-free-icons";
import { useRouter } from "next/router";

const quickLinks = [
  { icon: Home01Icon, label: "Home", href: "/", desc: "Return to homepage" },
  {
    icon: Search01Icon,
    label: "Search Properties",
    href: "/property",
    desc: "Browse available listings",
  },
  {
    icon: MapPinIcon,
    label: "Our Agents",
    href: "/agent",
    desc: "Connect with real estate agents",
  },
];

const ErrorPage = () => {
  const router = useRouter();

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-16"
      style={{ background: "#f7f7f5" }}
    >
      <div className="max-w-2xl mx-auto w-full text-center">
        {/* ── Eyebrow ───────────────────────────────────────────────── */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div
            className="h-[2px] w-5 rounded"
            style={{ background: "#F25912" }}
          />
          <span
            className="text-[11px] font-bold uppercase tracking-[0.18em]"
            style={{ color: "#F25912" }}
          >
            Error
          </span>
          <div
            className="h-[2px] w-5 rounded"
            style={{ background: "#F25912" }}
          />
        </div>

        {/* ── 404 number ────────────────────────────────────────────── */}
        <div className="relative mb-4 select-none">
          {/* Ghost number */}
          <span
            className="text-[clamp(120px,22vw,200px)] font-extrabold leading-none"
            style={{
              color: "transparent",
              WebkitTextStroke: "2px #ebebeb",
              display: "block",
            }}
          >
            404
          </span>

          {/* Orange accent bar — overlaps the number */}
          <div
            className="absolute left-1/2 -translate-x-1/2"
            style={{
              bottom: "18%",
              height: "6px",
              width: "80px",
              background: "#F25912",
              borderRadius: "3px",
            }}
          />
        </div>

        {/* ── Copy ──────────────────────────────────────────────────── */}
        <h2
          className="text-2xl md:text-3xl font-extrabold mb-3 leading-tight"
          style={{ color: "#222831" }}
        >
          Page Not Found
        </h2>
        <p
          className="text-sm leading-relaxed max-w-sm mx-auto mb-10"
          style={{ color: "#9ca3af" }}
        >
          The page you're looking for may have moved or no longer exists. Here
          are some places you can go instead.
        </p>

        {/* ── Quick links ───────────────────────────────────────────── */}
        <div className="grid md:grid-cols-3 gap-3 mb-8">
          {quickLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => router.push(link.href)}
              className="group rounded-2xl p-5 text-center transition-all"
              style={{ background: "#fff", border: "1px solid #ebebeb" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor =
                  "#F25912";
                (e.currentTarget as HTMLButtonElement).style.transform =
                  "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor =
                  "#ebebeb";
                (e.currentTarget as HTMLButtonElement).style.transform =
                  "translateY(0)";
              }}
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center mx-auto mb-3 transition-all"
                style={{ background: "#fff3ee" }}
              >
                <HugeiconsIcon
                  icon={link.icon}
                  size={20}
                  color="#F25912"
                  strokeWidth={1.5}
                />
              </div>
              <p
                className="text-sm font-extrabold mb-0.5"
                style={{ color: "#222831" }}
              >
                {link.label}
              </p>
              <p className="text-xs" style={{ color: "#9ca3af" }}>
                {link.desc}
              </p>
            </button>
          ))}
        </div>

        {/* ── Back button ───────────────────────────────────────────── */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white transition-all"
          style={{ background: "#222831" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#F25912")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#222831")}
        >
          <HugeiconsIcon
            icon={ArrowLeft01Icon}
            size={16}
            color="white"
            strokeWidth={2}
          />
          Go Back
        </button>

        {/* ── Decorative dashed line ────────────────────────────────── */}
        <div className="mt-14 opacity-40">
          <svg
            viewBox="0 0 320 40"
            fill="none"
            className="w-full max-w-xs mx-auto"
          >
            <path
              d="M10 20 Q60 5 110 20 Q160 35 210 20 Q260 5 310 20"
              stroke="#F25912"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeDasharray="6 5"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
