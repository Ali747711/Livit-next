import { NextPage } from "next";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import HeaderFilter from "@/components/home/HeaderFilter";
import PopularProperties from "@/components/home/PopularProerties";
import TopProperties from "@/components/home/TopProperties";
import CTASection from "@/components/home/CTASection";
import Advertisement from "@/components/home/Advertisement";

// ── Reusable section header ───────────────────────────────────────────────────
const SectionHead = ({
  eyebrow,
  title,
  onViewAll,
}: {
  eyebrow: string;
  title: string;
  onViewAll?: () => void;
}) => (
  <div className="flex items-end justify-between mb-8">
    <div>
      <div className="flex items-center gap-2 mb-2">
        <div
          className="h-[2px] w-5 rounded"
          style={{ background: "#F25912" }}
        />
        <span
          className="text-[11px] font-bold uppercase tracking-[0.18em]"
          style={{ color: "#F25912" }}
        >
          {eyebrow}
        </span>
      </div>
      <h2
        className="text-2xl md:text-3xl font-extrabold leading-tight"
        style={{ color: "#222831" }}
      >
        {title}
      </h2>
    </div>

    {onViewAll && (
      <button
        onClick={onViewAll}
        className="flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold border transition-all flex-shrink-0"
        style={{ borderColor: "#222831", color: "#222831" }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = "#222831";
          (e.currentTarget as HTMLButtonElement).style.color = "#fff";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background =
            "transparent";
          (e.currentTarget as HTMLButtonElement).style.color = "#222831";
        }}
      >
        View All
        <svg
          width="12"
          height="12"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          viewBox="0 0 24 24"
        >
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </button>
    )}
  </div>
);

// ── Page ──────────────────────────────────────────────────────────────────────
const Home: NextPage = () => {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) return null;

  return (
    <div className="min-h-screen" style={{ background: "#f7f7f5" }}>
      {/* ══ HERO ══════════════════════════════════════════════════════ */}
      <section className="relative w-full min-h-screen overflow-hidden">
        <img
          src="/img/banner/hero.jpg"
          alt="hero"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(20,20,20,0.88) 0%, rgba(20,20,20,0.42) 45%, rgba(0,0,0,0.08) 100%)",
          }}
        />

        {/* Orange glow bottom-left */}
        <div
          className="absolute bottom-0 left-0 w-[500px] h-[300px] pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at bottom left, rgba(242,89,18,0.18) 0%, transparent 65%)",
          }}
        />

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 pb-14 px-8 md:px-16 max-w-5xl">
          <div className="flex items-center gap-2 mb-4">
            <div
              className="h-[2px] w-5 rounded"
              style={{ background: "#F25912" }}
            />
            <p
              className="text-[11px] font-bold uppercase tracking-[0.2em]"
              style={{ color: "#F25912" }}
            >
              Premium Real Estate
            </p>
          </div>

          <h1
            className="text-4xl md:text-6xl font-extrabold text-white leading-[1.05] mb-5 max-w-2xl"
            style={{ textShadow: "0 2px 20px rgba(0,0,0,0.4)" }}
          >
            Your Home Deserves
            <br />
            the Most Trusted.
          </h1>

          <p
            className="text-base mb-8 max-w-lg"
            style={{ color: "rgba(255,255,255,0.6)" }}
          >
            Your home is more than walls and a roof — it's your comfort, your
            memories, your peace. You deserve a team that values it as much as
            you do.
          </p>

          <div className="max-w-2xl">
            <HeaderFilter />
          </div>
        </div>
      </section>

      {/* ══ ABOUT / CONFIDENCE BENTO ══════════════════════════════════ */}
      <section className="container mx-auto px-6 max-w-7xl py-20">
        <div className="grid lg:grid-cols-2 gap-10 items-start">
          {/* Left */}
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
            <h2
              className="text-3xl md:text-4xl font-extrabold leading-tight mb-8"
              style={{ color: "#222831" }}
            >
              Have confidence in any
              <br />
              market with us.
            </h2>
            <div
              className="rounded-2xl overflow-hidden"
              style={{ height: "340px" }}
            >
              <img
                src="/img/banner/about1.jpg"
                alt="interior"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Right */}
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div
                className="rounded-2xl overflow-hidden"
                style={{ height: "180px" }}
              >
                <img
                  src="/img/banner/about2.jpg"
                  alt="property"
                  className="w-full h-full object-cover"
                />
              </div>
              <div
                className="rounded-2xl overflow-hidden"
                style={{ height: "180px" }}
              >
                <img
                  src="/img/banner/about3.jpg"
                  alt="property"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <p
                className="text-sm leading-relaxed"
                style={{ color: "#6b7280" }}
              >
                We don't just keep up with the market — we lead it. Backed by
                over 140,000 agents in more than 9,000 offices worldwide, our
                network delivers global reach.
              </p>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "#6b7280" }}
              >
                Whether you're buying, selling, or investing, our agents bring
                the experience, insight, and reach to turn possibilities into
                success.
              </p>
            </div>

            <div style={{ borderTop: "1px solid #ebebeb", paddingTop: "20px" }}>
              <h3
                className="text-xl md:text-2xl font-extrabold leading-snug"
                style={{ color: "#222831" }}
              >
                Moving starts with the right agent — and no one sells more than
                Livit®.
              </h3>
            </div>
          </div>
        </div>
      </section>

      {/* ══ POPULAR SEARCHES ══════════════════════════════════════════ */}
      <section
        className="container mx-auto px-6 max-w-7xl py-20"
        style={{ borderTop: "1px solid #ebebeb" }}
      >
        <SectionHead
          eyebrow="Trending"
          title="Popular Searches Nearby"
          onViewAll={() => router.push("/property")}
        />
        <PopularProperties />
      </section>

      {/* ══ ADVERTISEMENT VIDEO ════════════════════════════════════════ */}
      <section style={{ borderTop: "1px solid #ebebeb" }}>
        <div className="container mx-auto px-6 max-w-7xl py-20">
          <Advertisement />
        </div>
      </section>

      {/* ══ NEW PROPERTIES ════════════════════════════════════════════ */}
      <section style={{ borderTop: "1px solid #ebebeb" }}>
        <div className="container mx-auto px-6 max-w-7xl py-20">
          <SectionHead
            eyebrow="Just Added"
            title="New Properties"
            onViewAll={() => router.push("/property")}
          />
          <TopProperties />
        </div>
      </section>

      {/* ══ CTA ═══════════════════════════════════════════════════════ */}
      <CTASection />
    </div>
  );
};

export default Home;
