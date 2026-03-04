import { useRouter } from "next/router";

const Advertisement = () => {
  const router = useRouter();

  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden"
      style={{ height: "560px" }}
    >
      {/* ── Video ────────────────────────────────────────────────────── */}
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/video/ads.mov" type="video/mp4" />
      </video>

      {/* ── Gradient overlay ─────────────────────────────────────────── */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, rgba(10,10,10,0.92) 0%, rgba(10,10,10,0.45) 48%, rgba(0,0,0,0.08) 100%)",
        }}
      />

      {/* ── Orange corner glow ───────────────────────────────────────── */}
      <div
        className="absolute bottom-0 left-0 w-80 h-60 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at bottom left, rgba(242,89,18,0.2) 0%, transparent 65%)",
        }}
      />

      {/* ── Top-left "Featured" eyebrow ──────────────────────────────── */}
      <div className="absolute top-8 left-8 md:top-10 md:left-12 flex items-center gap-2">
        <div
          className="h-[2px] w-5 rounded"
          style={{ background: "#F25912" }}
        />
        <span
          className="text-[10px] font-bold uppercase tracking-[0.2em]"
          style={{ color: "#F25912" }}
        >
          Featured
        </span>
      </div>

      {/* ── Bottom content ───────────────────────────────────────────── */}
      <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
        <h2
          className="text-3xl md:text-5xl font-extrabold text-white leading-[1.07] mb-4 max-w-xl"
          style={{ textShadow: "0 2px 20px rgba(0,0,0,0.3)" }}
        >
          Find Your Perfect
          <br />
          Place to Call Home
        </h2>

        <p
          className="text-base mb-8 max-w-md"
          style={{ color: "rgba(255,255,255,0.65)" }}
        >
          Discover thousands of properties across Korea's most desirable
          locations.
        </p>

        {/* CTA button — orange pill matching design system */}
        <button
          onClick={() => router.push("/property")}
          className="group relative inline-flex items-center gap-3 px-7 py-3.5 rounded-full text-sm font-bold text-white overflow-hidden transition-all"
          style={{
            background: "#F25912",
            boxShadow: "0 6px 24px rgba(242,89,18,0.45)",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          Explore Properties
          <svg
            width="14"
            height="14"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            viewBox="0 0 24 24"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>

        {/* Stats strip */}
        <div
          className="flex items-center gap-8 mt-8 pt-7"
          style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}
        >
          {[
            { value: "10K+", label: "Verified Listings" },
            { value: "2K+", label: "Trusted Agents" },
            { value: "15+", label: "Years Active" },
          ].map(({ value, label }) => (
            <div key={label}>
              <p className="text-lg font-extrabold text-white leading-none">
                {value}
              </p>
              <p
                className="text-[11px] mt-0.5"
                style={{ color: "rgba(255,255,255,0.4)" }}
              >
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Advertisement;
