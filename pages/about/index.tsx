import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Building01Icon,
  Home01Icon,
  UserIcon,
  CheckmarkCircle01Icon,
  Award01Icon,
  StarAward01FreeIcons,
  ArrowRight01Icon,
  Location01Icon,
  Mail01Icon,
} from "@hugeicons/core-free-icons";

const stats = [
  { value: "10,000+", label: "Properties Listed" },
  { value: "5,000+", label: "Happy Clients" },
  { value: "500+", label: "Partner Agents" },
  { value: "50+", label: "Cities Covered" },
];

const values = [
  {
    icon: CheckmarkCircle01Icon,
    title: "Trust & Transparency",
    description:
      "We believe in honest dealings and transparent processes for every transaction, with no hidden fees or surprises.",
  },
  {
    icon: StarAward01FreeIcons,
    title: "Quality Service",
    description:
      "Premium service standards ensuring the best possible experience for every client we work with.",
  },
  {
    icon: Award01Icon,
    title: "Expert Guidance",
    description:
      "Professional support from experienced real estate specialists who know the Korean market inside out.",
  },
];

const AboutPage = () => {
  return (
    <div className="min-h-screen" style={{ background: "#f7f7f5" }}>
      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="container mx-auto px-6 max-w-7xl pt-14 pb-16">
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          {/* Left — text */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div
                className="h-[2px] w-5 rounded"
                style={{ background: "#F25912" }}
              />
              <span
                className="text-[11px] font-bold uppercase tracking-[0.18em]"
                style={{ color: "#F25912" }}
              >
                About Us
              </span>
            </div>

            <h1
              className="text-4xl md:text-5xl font-extrabold leading-[1.06] mb-6"
              style={{ color: "#222831" }}
            >
              Find Your Perfect
              <br />
              Home in Korea
            </h1>

            <p
              className="text-base leading-relaxed mb-8 max-w-lg"
              style={{ color: "#6b7280" }}
            >
              We're dedicated to helping you discover the ideal apartment for
              sale or rent across South Korea. With our expertise and
              comprehensive listings, your dream home is just a search away.
            </p>

            <div className="flex flex-wrap gap-3">
              <a
                href="/property"
                className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold text-white transition-all"
                style={{
                  background: "#F25912",
                  boxShadow: "0 4px 14px rgba(242,89,18,0.28)",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                Browse Listings
                <HugeiconsIcon
                  icon={ArrowRight01Icon}
                  size={15}
                  color="white"
                  strokeWidth={2.5}
                />
              </a>
              <a
                href="/agent"
                className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold border transition-all"
                style={{ borderColor: "#ebebeb", color: "#374151" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.borderColor =
                    "#222831";
                  (e.currentTarget as HTMLAnchorElement).style.color =
                    "#222831";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.borderColor =
                    "#ebebeb";
                  (e.currentTarget as HTMLAnchorElement).style.color =
                    "#374151";
                }}
              >
                Meet Our Agents
              </a>
            </div>
          </div>

          {/* Right — bento images */}
          <div className="grid grid-cols-2 gap-3 h-[400px]">
            <div className="rounded-2xl overflow-hidden row-span-2">
              <img
                src="/img/banner/about1.jpg"
                alt="Interior"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="rounded-2xl overflow-hidden">
              <img
                src="/img/banner/about2.jpg"
                alt="Exterior"
                className="w-full h-full object-cover"
              />
            </div>
            <div
              className="rounded-2xl flex flex-col items-center justify-center gap-1"
              style={{ background: "#222831" }}
            >
              <span className="text-3xl font-extrabold text-white">15+</span>
              <span
                className="text-xs font-semibold"
                style={{ color: "rgba(255,255,255,0.45)" }}
              >
                Years of Excellence
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="container mx-auto px-6 max-w-7xl">
        <div style={{ height: "1px", background: "#ebebeb" }} />
      </div>

      {/* ── Stats strip ───────────────────────────────────────────────── */}
      <section className="container mx-auto px-6 max-w-7xl py-12">
        <div
          className="rounded-2xl grid grid-cols-2 md:grid-cols-4 overflow-hidden"
          style={{ background: "#fff", border: "1px solid #ebebeb" }}
        >
          {stats.map(({ value, label }, i) => (
            <div
              key={label}
              className="flex flex-col items-center py-8 px-4"
              style={{
                borderRight:
                  i < stats.length - 1 ? "1px solid #f3f4f6" : "none",
              }}
            >
              <span
                className="text-3xl md:text-4xl font-extrabold"
                style={{ color: "#F25912" }}
              >
                {value}
              </span>
              <span
                className="text-sm font-medium mt-1.5"
                style={{ color: "#9ca3af" }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Mission ───────────────────────────────────────────────────── */}
      <section className="container mx-auto px-6 max-w-7xl py-12">
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Label column */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div
                className="h-[2px] w-5 rounded"
                style={{ background: "#F25912" }}
              />
              <span
                className="text-[11px] font-bold uppercase tracking-[0.18em]"
                style={{ color: "#F25912" }}
              >
                Our Purpose
              </span>
            </div>
            <h2
              className="text-2xl md:text-3xl font-extrabold leading-tight"
              style={{ color: "#222831" }}
            >
              A Mission Built Around You
            </h2>
          </div>

          {/* Text column */}
          <div
            className="lg:col-span-3 rounded-2xl p-8"
            style={{ background: "#fff", border: "1px solid #ebebeb" }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center mb-5"
              style={{ background: "#fff3ee" }}
            >
              <HugeiconsIcon
                icon={Home01Icon}
                size={20}
                color="#F25912"
                strokeWidth={1.5}
              />
            </div>

            <p
              className="text-sm leading-[1.85] mb-5"
              style={{ color: "#6b7280" }}
            >
              At the heart of Korea's real estate market, we strive to make
              finding and securing your perfect apartment simple, transparent,
              and stress-free. Whether you're looking to buy your first home or
              rent a comfortable space, we provide the tools, expertise, and
              support you need.
            </p>

            <p className="text-sm leading-[1.85]" style={{ color: "#6b7280" }}>
              Our platform connects you with verified listings, trusted agents,
              and comprehensive neighbourhood information to help you make
              informed decisions. From Seoul to Busan and everywhere in between
              — we're here to guide you home.
            </p>
          </div>
        </div>
      </section>

      {/* ── Values ────────────────────────────────────────────────────── */}
      <section className="container mx-auto px-6 max-w-7xl py-12">
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-3">
            <div
              className="h-[2px] w-5 rounded"
              style={{ background: "#F25912" }}
            />
            <span
              className="text-[11px] font-bold uppercase tracking-[0.18em]"
              style={{ color: "#F25912" }}
            >
              What We Stand For
            </span>
          </div>
          <h2
            className="text-2xl md:text-3xl font-extrabold"
            style={{ color: "#222831" }}
          >
            Our Core Values
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {values.map(({ icon, title, description }, i) => (
            <ValueCard
              key={i}
              icon={icon}
              title={title}
              description={description}
            />
          ))}
        </div>
      </section>

      {/* ── Contact CTA ───────────────────────────────────────────────── */}
      <section className="container mx-auto px-6 max-w-7xl py-12 pb-20">
        <div
          className="rounded-2xl overflow-hidden relative"
          style={{ background: "#222831" }}
        >
          {/* Dot texture */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />
          {/* Orange glow */}
          <div
            className="absolute bottom-0 right-0 w-[420px] h-[320px] rounded-full blur-3xl opacity-[0.06] pointer-events-none"
            style={{ background: "#F25912" }}
          />

          <div className="relative px-8 md:px-14 py-14 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="max-w-lg">
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="h-[2px] w-5 rounded"
                  style={{ background: "#F25912" }}
                />
                <span
                  className="text-[11px] font-bold uppercase tracking-[0.18em]"
                  style={{ color: "#F25912" }}
                >
                  Get In Touch
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-white leading-tight mb-3">
                Have Questions?
                <br />
                We're Here to Help.
              </h2>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "rgba(255,255,255,0.45)" }}
              >
                Our team of real estate experts is ready to guide you through
                every step of finding your perfect home. Let's start your
                journey today.
              </p>
            </div>

            <div className="flex flex-col gap-3 flex-shrink-0">
              <a
                href="mailto:HyuMin@livit.com"
                className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold text-white transition-all"
                style={{
                  background: "#F25912",
                  boxShadow: "0 4px 14px rgba(242,89,18,0.35)",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                <HugeiconsIcon
                  icon={Mail01Icon}
                  size={15}
                  color="white"
                  strokeWidth={2}
                />
                Send Us an Email
              </a>
              <a
                href="/agent"
                className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold border transition-all text-center justify-center"
                style={{
                  borderColor: "rgba(255,255,255,0.2)",
                  color: "rgba(255,255,255,0.65)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.borderColor =
                    "#F25912";
                  (e.currentTarget as HTMLAnchorElement).style.color =
                    "#F25912";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.borderColor =
                    "rgba(255,255,255,0.2)";
                  (e.currentTarget as HTMLAnchorElement).style.color =
                    "rgba(255,255,255,0.65)";
                }}
              >
                <HugeiconsIcon
                  icon={UserIcon}
                  size={15}
                  color="currentColor"
                  strokeWidth={1.5}
                />
                Browse Agents
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

// ── Value card with hover ─────────────────────────────────────────────────────
const ValueCard = ({
  icon,
  title,
  description,
}: {
  icon: any;
  title: string;
  description: string;
}) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="rounded-2xl p-7 transition-all cursor-default"
      style={{
        background: "#fff",
        border: `1px solid ${hovered ? "#F25912" : "#ebebeb"}`,
        boxShadow: hovered ? "0 8px 30px rgba(242,89,18,0.08)" : "none",
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
        transition: "all 0.3s ease",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center mb-5 transition-all"
        style={{ background: hovered ? "#F25912" : "#fff3ee" }}
      >
        <HugeiconsIcon
          icon={icon}
          size={22}
          color={hovered ? "#fff" : "#F25912"}
          strokeWidth={1.5}
        />
      </div>
      <h3
        className="text-base font-extrabold mb-2 transition-colors"
        style={{ color: "#222831" }}
      >
        {title}
      </h3>
      <p className="text-sm leading-relaxed" style={{ color: "#6b7280" }}>
        {description}
      </p>
    </div>
  );
};

export default AboutPage;
