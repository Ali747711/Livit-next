import React from "react";
import { useRouter } from "next/router";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import HoverArrowButton from "../hover-arrow-button";
import TextLoop from "../text-loop";

const CTASection: React.FC = () => {
  const router = useRouter();

  return (
    <section
      className="relative overflow-hidden"
      style={{ minHeight: "320px" }}
    >
      {/* Background image */}
      <img
        src="/img/banner/cta.jpg"
        alt="luxury property"
        className="absolute inset-0 w-full h-full object-cover"
      />
      {/* Dark overlay */}
      <div
        className="absolute inset-0"
        style={{ background: "rgba(20,20,20,0.72)" }}
      />
      {/* Subtle orange bottom glow */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[180px] rounded-full opacity-[0.14] blur-3xl pointer-events-none"
        style={{ background: "#F25912" }}
      />

      {/* Content — centered */}
      <div className="relative z-10 container mx-auto px-6 max-w-7xl flex flex-col items-center justify-center text-center py-24">
        <p
          className="text-sm font-bold uppercase tracking-[0.2em] mb-4"
          style={{ color: "#F25912" }}
        >
          Luxury Collection
        </p>

        <h2 className="text-3xl md:text-5xl font-extrabold text-white leading-tight mb-3 max-w-xl">
          Fine Homes &amp; Luxury Properties
        </h2>

        <p className="text-white/50 text-sm mb-8 max-w-md">
          Let me know if you want a shorter or even more high-end version.
        </p>

        {/* CTA — white outlined pill with arrow */}
        <button
          onClick={() => router.push("/property")}
          className="group flex items-center gap-3 px-8 py-3.5 rounded-full text-sm font-bold text-white border-2 transition-all"
          style={{ borderColor: "rgba(255,255,255,0.5)" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor =
              "#F25912";
            (e.currentTarget as HTMLButtonElement).style.background =
              "rgba(242,89,18,0.15)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor =
              "rgba(255,255,255,0.5)";
            (e.currentTarget as HTMLButtonElement).style.background =
              "transparent";
          }}
        >
          DISCOVER LUXURY
          <span
            className="w-7 h-7 rounded-full flex items-center justify-center transition-all group-hover:translate-x-1"
            style={{ background: "rgba(255,255,255,0.15)" }}
          >
            <svg
              width="13"
              height="13"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </span>
        </button>
      </div>
    </section>
  );
};

export default CTASection;
