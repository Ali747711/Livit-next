import { useRouter } from "next/router";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Home01Icon,
  Mail01Icon,
  SmartPhone01Icon,
  Location01Icon,
  Facebook01Icon,
  YoutubeIcon,
  InstagramFreeIcons,
  TwitterFreeIcons,
} from "@hugeicons/core-free-icons";

const Footer = () => {
  const router = useRouter();
  const currentYear = new Date().getFullYear();

  const productLinks = [
    { label: "Marketplace", href: "/property" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Sales Software", href: "/" },
    { label: "Terms & Conditions", href: "/terms" },
  ];

  const helpLinks = [
    { label: "Academy", href: "/" },
    { label: "Community", href: "/community" },
    { label: "Knowledge Base", href: "/" },
  ];

  const companyLinks = [
    { label: "Login", href: "/account" },
    { label: "Sign up", href: "/account" },
    { label: "Cookie Policy", href: "/cookies" },
  ];

  const socialLinks = [
    { icon: TwitterFreeIcons, href: "#", label: "Twitter" },
    { icon: Facebook01Icon, href: "#", label: "Facebook" },
    { icon: InstagramFreeIcons, href: "#", label: "Instagram" },
    { icon: YoutubeIcon, href: "#", label: "YouTube" },
  ];

  return (
    <footer style={{ background: "#222831" }}>
      {/* Main footer content */}
      <div className="container mx-auto px-6 max-w-7xl py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand column */}
          <div>
            <div className="flex items-center gap-2.5 mb-5">
              <img
                src="/img/logo.png"
                alt="Logo"
                className="w-20 h-9 object-cover rounded-2xl"
              />
            </div>
            <p
              className="text-sm leading-relaxed mb-5"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              Livit LLC is an Equal Opportunity Employer and supports the Fair
              Housing Act and equal opportunity housing.
            </p>
            <div className="flex items-center gap-2">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                  style={{ background: "rgba(255,255,255,0.07)" }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.background =
                      "#F25912";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.background =
                      "rgba(255,255,255,0.07)";
                  }}
                >
                  <HugeiconsIcon
                    icon={social.icon}
                    size={15}
                    color="rgba(255,255,255,0.7)"
                    strokeWidth={1.5}
                  />
                </a>
              ))}
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-sm font-bold text-white mb-5 uppercase tracking-wider">
              Product
            </h3>
            <ul className="space-y-3">
              {productLinks.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => router.push(link.href)}
                    className="text-sm transition-colors"
                    style={{ color: "rgba(255,255,255,0.45)" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = "#F25912")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = "rgba(255,255,255,0.45)")
                    }
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Help Center */}
          <div>
            <h3 className="text-sm font-bold text-white mb-5 uppercase tracking-wider">
              Help Center
            </h3>
            <ul className="space-y-3">
              {helpLinks.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => router.push(link.href)}
                    className="text-sm transition-colors"
                    style={{ color: "rgba(255,255,255,0.45)" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = "#F25912")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = "rgba(255,255,255,0.45)")
                    }
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-bold text-white mb-5 uppercase tracking-wider">
              Company
            </h3>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => router.push(link.href)}
                    className="text-sm transition-colors"
                    style={{ color: "rgba(255,255,255,0.45)" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = "#F25912")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = "rgba(255,255,255,0.45)")
                    }
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="container mx-auto px-6 max-w-7xl py-5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
              © {currentYear} Livit, LLC. All Rights Reserved.
            </p>
            <div className="flex items-center gap-6">
              {["Privacy Notice", "Terms of Use", "Your Privacy Choices"].map(
                (label) => (
                  <button
                    key={label}
                    className="text-xs transition-colors"
                    style={{ color: "rgba(255,255,255,0.3)" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = "#F25912")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = "rgba(255,255,255,0.3)")
                    }
                  >
                    {label}
                  </button>
                ),
              )}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
