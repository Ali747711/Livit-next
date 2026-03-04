import { logIn, signUp } from "@/lib/auth";
import { NextPage } from "next";
import { useRouter } from "next/router";
import React, { useCallback, useState } from "react";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  UserIcon,
  LockPasswordIcon,
  SmartPhone01Icon,
  Home01Icon,
  CheckmarkCircle01Icon,
  ArrowRight01Icon,
  Building01Icon,
} from "@hugeicons/core-free-icons";

// ── Input field ────────────────────────────────────────────────────────────────
const InputField = ({
  id,
  name,
  type = "text",
  icon,
  placeholder,
  value,
  onChange,
  label,
  required,
}: {
  id: string;
  name: string;
  type?: string;
  icon: any;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label: string;
  required?: boolean;
}) => (
  <div>
    <label
      className="block text-xs font-bold uppercase tracking-[0.12em] mb-1.5"
      style={{ color: "#6b7280" }}
    >
      {label}
      {required && <span style={{ color: "#F25912" }}> *</span>}
    </label>
    <div className="relative">
      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
        <HugeiconsIcon
          icon={icon}
          size={16}
          color="#9ca3af"
          strokeWidth={1.5}
        />
      </div>
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        style={{
          width: "100%",
          height: "44px",
          paddingLeft: "40px",
          paddingRight: "14px",
          borderRadius: "10px",
          border: "1px solid #ebebeb",
          fontSize: "14px",
          color: "#374151",
          background: "#f9fafb",
          outline: "none",
          transition: "all 0.2s",
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = "#F25912";
          e.currentTarget.style.background = "#fff";
          e.currentTarget.style.boxShadow = "0 0 0 3px rgba(242,89,18,0.08)";
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = "#ebebeb";
          e.currentTarget.style.background = "#f9fafb";
          e.currentTarget.style.boxShadow = "none";
        }}
      />
    </div>
  </div>
);

// ── Page ───────────────────────────────────────────────────────────────────────
const Join: NextPage = () => {
  const router = useRouter();

  const [input, setInput] = useState({
    nick: "",
    name: "",
    password: "",
    phone: "",
    type: "USER",
  });
  const [loginView, setLoginView] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, name } = e.target;
    setInput((p) => ({ ...p, [name]: value }));
  };

  const login = useCallback(async () => {
    try {
      setLoading(true);
      await logIn(input.nick, input.password);
      toast.success("Welcome back!");
      await router.push("/");
    } catch (error: any) {
      toast.error(error?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }, [input, router]);

  const signup = useCallback(async () => {
    try {
      setLoading(true);
      await signUp(
        input.nick,
        input.name,
        input.password,
        input.phone,
        input.type,
      );
      toast.success("Account created!");
      await router.push("/");
    } catch (error: any) {
      toast.error(error?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  }, [input, router]);

  const features = [
    "10,000+ verified properties across Korea",
    "Connect directly with trusted agents",
    "Real-time listings & price history",
  ];

  return (
    <div className="flex min-h-screen" style={{ background: "#f7f7f5" }}>
      {/* ── LEFT PANEL — image ─────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[52%] relative flex-col overflow-hidden">
        {/* Photo */}
        <img
          src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1400&q=80&auto=format&fit=crop"
          alt="Beautiful Korean home"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Layered overlay — keeps top readable, bottom legible */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(160deg, rgba(34,40,49,0.65) 0%, rgba(34,40,49,0.3) 45%, rgba(34,40,49,0.82) 100%)",
          }}
        />

        {/* Orange glow — bottom left corner */}
        <div
          className="absolute bottom-0 left-0 w-96 h-64 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at bottom left, rgba(242,89,18,0.22) 0%, transparent 65%)",
          }}
        />

        {/* Logo */}
        <div className="relative z-10 p-8">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2.5 transition-opacity"
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.75")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            <img
              src="/img/logo.png"
              alt="Logo"
              className="w-20 h-9 object-cover rounded-2xl"
            />
          </button>
        </div>

        {/* Bottom copy */}
        <div className="relative z-10 mt-auto p-8 pb-10">
          <div className="flex items-center gap-2 mb-3">
            <div
              className="h-[2px] w-5 rounded"
              style={{ background: "#F25912" }}
            />
            <span
              className="text-[10px] font-bold uppercase tracking-[0.18em]"
              style={{ color: "#F25912" }}
            >
              Korea's Premier Platform
            </span>
          </div>

          <h2 className="text-[2.1rem] font-extrabold text-white leading-[1.08] mb-5">
            Find Your Perfect
            <br />
            Home in Korea
          </h2>

          <div className="space-y-3 mb-6">
            {features.map((f, i) => (
              <div key={i} className="flex items-center gap-3">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    background: "rgba(242,89,18,0.22)",
                    border: "1px solid rgba(242,89,18,0.4)",
                  }}
                >
                  <HugeiconsIcon
                    icon={CheckmarkCircle01Icon}
                    size={12}
                    color="#F25912"
                    strokeWidth={2.5}
                  />
                </div>
                <span
                  className="text-sm font-medium"
                  style={{ color: "rgba(255,255,255,0.72)" }}
                >
                  {f}
                </span>
              </div>
            ))}
          </div>

          {/* Stats row */}
          <div
            className="flex items-center gap-7 pt-5"
            style={{ borderTop: "1px solid rgba(255,255,255,0.12)" }}
          >
            {[
              { value: "10K+", label: "Properties" },
              { value: "2K+", label: "Agents" },
              { value: "98%", label: "Satisfaction" },
            ].map(({ value, label }) => (
              <div key={label}>
                <p className="text-xl font-extrabold text-white leading-none">
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

      {/* ── RIGHT PANEL — form ─────────────────────────────────────────── */}
      <div className="flex flex-1 items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-[440px]">
          {/* Mobile logo */}
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 mb-8 lg:hidden"
          >
            <img
              src="/img/logo.png"
              alt="Logo"
              className="w-20 h-9 object-cover rounded-2xl"
            />
          </button>

          {/* Heading */}
          <div className="mb-7">
            <div className="flex items-center gap-2 mb-2">
              <div
                className="h-[2px] w-4 rounded"
                style={{ background: "#F25912" }}
              />
              <span
                className="text-[10px] font-bold uppercase tracking-[0.18em]"
                style={{ color: "#F25912" }}
              >
                {loginView ? "Welcome back" : "Get started"}
              </span>
            </div>
            <h1
              className="text-2xl font-extrabold"
              style={{ color: "#222831" }}
            >
              {loginView ? "Sign In to Your Account" : "Create an Account"}
            </h1>
            <p className="text-sm mt-1" style={{ color: "#9ca3af" }}>
              {loginView
                ? "Enter your credentials to continue browsing"
                : "Join thousands of happy homeowners today"}
            </p>
          </div>

          {/* Sign In / Sign Up toggle */}
          <div
            className="flex rounded-xl p-1 mb-7"
            style={{ background: "#fff", border: "1px solid #ebebeb" }}
          >
            {[
              { label: "Sign In", view: true },
              { label: "Sign Up", view: false },
            ].map(({ label, view }) => (
              <button
                key={label}
                type="button"
                onClick={() => setLoginView(view)}
                className="flex-1 py-2.5 rounded-lg text-sm font-bold transition-all"
                style={{
                  background: loginView === view ? "#222831" : "transparent",
                  color: loginView === view ? "#fff" : "#9ca3af",
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              loginView ? login() : signup();
            }}
            className="rounded-2xl p-7 space-y-4"
            style={{ background: "#fff", border: "1px solid #ebebeb" }}
          >
            {!loginView && (
              <InputField
                id="name"
                name="name"
                icon={UserIcon}
                label="Full Name"
                placeholder="Azamat Tashmuratov"
                value={input.name}
                onChange={handleInput}
                required
              />
            )}

            <InputField
              id="nick"
              name="nick"
              icon={UserIcon}
              label="Nickname"
              placeholder="beki_traveler"
              value={input.nick}
              onChange={handleInput}
              required
            />

            <InputField
              id="password"
              name="password"
              type="password"
              icon={LockPasswordIcon}
              label="Password"
              placeholder="Enter a secure password"
              value={input.password}
              onChange={handleInput}
              required
            />

            {!loginView && (
              <>
                <InputField
                  id="phone"
                  name="phone"
                  type="tel"
                  icon={SmartPhone01Icon}
                  label="Phone Number"
                  placeholder="+82 10-1234-5678"
                  value={input.phone}
                  onChange={handleInput}
                  required
                />

                <div>
                  <label
                    className="block text-xs font-bold uppercase tracking-[0.12em] mb-2"
                    style={{ color: "#6b7280" }}
                  >
                    Account Type <span style={{ color: "#F25912" }}>*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      {
                        value: "USER",
                        label: "User",
                        icon: UserIcon,
                        desc: "Looking to rent or buy",
                      },
                      {
                        value: "AGENT",
                        label: "Agent",
                        icon: Home01Icon,
                        desc: "Property owner or agent",
                      },
                    ].map(({ value, label, icon, desc }) => {
                      const isActive = input.type === value;
                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() =>
                            setInput((p) => ({ ...p, type: value }))
                          }
                          className="relative p-3 rounded-xl text-left transition-all"
                          style={{
                            border: `1px solid ${isActive ? "#F25912" : "#ebebeb"}`,
                            background: isActive ? "#fff3ee" : "#f9fafb",
                          }}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <HugeiconsIcon
                              icon={icon}
                              size={15}
                              color={isActive ? "#F25912" : "#9ca3af"}
                              strokeWidth={1.5}
                            />
                            <span
                              className="text-sm font-bold"
                              style={{
                                color: isActive ? "#F25912" : "#374151",
                              }}
                            >
                              {label}
                            </span>
                          </div>
                          <p
                            className="text-[10px]"
                            style={{ color: "#9ca3af" }}
                          >
                            {desc}
                          </p>
                          {isActive && (
                            <div
                              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center"
                              style={{ background: "#F25912" }}
                            >
                              <HugeiconsIcon
                                icon={CheckmarkCircle01Icon}
                                size={13}
                                color="white"
                                strokeWidth={2.5}
                              />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white disabled:opacity-50 transition-all mt-2"
              style={{
                background: "#F25912",
                boxShadow: "0 4px 16px rgba(242,89,18,0.30)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  {loginView ? "Sign In" : "Create Account"}
                  <HugeiconsIcon
                    icon={ArrowRight01Icon}
                    size={15}
                    color="white"
                    strokeWidth={2.5}
                  />
                </>
              )}
            </button>
          </form>

          {/* Switch */}
          <p className="text-center text-sm mt-5" style={{ color: "#9ca3af" }}>
            {loginView
              ? "Don't have an account? "
              : "Already have an account? "}
            <button
              type="button"
              onClick={() => setLoginView(!loginView)}
              className="font-bold underline underline-offset-4 transition-colors"
              style={{ color: "#F25912" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#222831")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#F25912")}
            >
              {loginView ? "Sign up" : "Log in"}
            </button>
          </p>

          {/* Back home */}
          <p className="text-center mt-3">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="text-xs transition-colors"
              style={{ color: "#d1d5db" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#9ca3af")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#d1d5db")}
            >
              ← Back to home
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Join;
