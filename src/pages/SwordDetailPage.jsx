import { useEffect, useRef } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { SWORDS, ELEMENT_COLORS, ELEMENT_ICONS } from "../data/swords";
import SwordViewer from "../components/SwordViewer";

// 0..1 alpha -> two-digit hex suffix, for appending to "#rrggbb" colors.
function hex(alpha) {
  return Math.round(Math.max(0, Math.min(1, alpha)) * 255)
    .toString(16)
    .padStart(2, "0");
}

export default function SwordDetailPage() {
  const { slug } = useParams();
  const idx = SWORDS.findIndex((s) => s.slug === slug);
  const sword = idx === -1 ? null : SWORDS[idx];

  const canvasWrapRef = useRef(null);

  // The fixed 3D background fades as you scroll into the story —
  // simple opacity fade rather than full camera parallax, kept it
  // light so this could ship as one complete pass.
  useEffect(() => {
    const onScroll = () => {
      if (!canvasWrapRef.current) return;
      const p = Math.min(1, window.scrollY / window.innerHeight);
      canvasWrapRef.current.style.opacity = String(1 - p * 0.62);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Reset scroll to top when moving between sword pages via prev/next.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!sword) {
    return <Navigate to="/collection" replace />;
  }

  const n = SWORDS.length;
  const prev = SWORDS[(idx - 1 + n) % n];
  const next = SWORDS[(idx + 1) % n];
  const accent = ELEMENT_COLORS[sword.element];
  const glow = sword.glow;

  return (
    <div
      style={{
        position: "relative",
        color: "var(--text-secondary)",
        fontFamily: "var(--font-body)",
      }}
    >
      {/* 3D background — fixed, fades on scroll */}
      <div
        ref={canvasWrapRef}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          transition: "opacity 0.4s ease",
        }}
      >
        <SwordViewer key={sword.slug} sword={sword} />
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background:
              "radial-gradient(120% 90% at 50% 42%, transparent 38%, rgba(5,10,20,0.55) 82%, rgba(5,10,20,0.92) 100%)",
          }}
        />
      </div>

      <div style={{ position: "relative", zIndex: 2 }}>
        {/* Header */}
        <header
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 5,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "26px clamp(22px, 5vw, 60px)",
          }}
        >
          <Link
            to="/collection"
            style={{
              textDecoration: "none",
              color: "#6f8295",
              fontFamily: "var(--font-display)",
              fontSize: "0.65rem",
              letterSpacing: "4px",
              textTransform: "uppercase",
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <span style={{ fontSize: "0.9rem", lineHeight: 1 }}>←</span> The
            Collection
          </Link>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "0.65rem",
              letterSpacing: "4px",
              color: "#4f6072",
            }}
          >
            {String(idx + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
          </span>
        </header>

        {/* Hero */}
        <section
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            alignItems: "center",
            padding: "0 24px clamp(36px, 7vh, 84px)",
            textAlign: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              marginBottom: "22px",
            }}
          >
            <span
              style={{
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                background: accent,
                boxShadow: `0 0 9px ${accent}, 0 0 20px ${accent}b3`,
              }}
            />
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "0.65rem",
                letterSpacing: "6px",
                textTransform: "uppercase",
                color: "#8a9bad",
              }}
            >
              {ELEMENT_ICONS[sword.element]} {sword.element}
            </span>
          </div>

          <h1
            style={{
              margin: 0,
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              color: "#f4f7fb",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              lineHeight: 0.98,
              fontSize: "clamp(46px, 9vw, 124px)",
              textShadow: `0 0 42px ${accent}${hex(0.5 * glow)}, 0 0 110px ${accent}${hex(0.28 * glow)}`,
            }}
          >
            {sword.name}
          </h1>

          <div
            style={{
              width: "220px",
              height: "1px",
              margin: "32px 0 24px",
              background: `linear-gradient(90deg, transparent, ${accent}${hex(0.55 + 0.2 * glow)}, transparent)`,
            }}
          />

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              alignItems: "center",
              gap: "10px 26px",
              fontSize: "0.78rem",
              letterSpacing: "2px",
              textTransform: "uppercase",
              color: "#647588",
            }}
          >
            <span>
              {Array.from({ length: 5 }, (_, s) =>
                s < sword.rarity ? "★" : "☆",
              ).join("")}
            </span>
            <span style={{ opacity: 0.4 }}>·</span>
            <span>{sword.origin}</span>
            <span style={{ opacity: 0.4 }}>·</span>
            <span>{sword.era}</span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "stretch",
              gap: "clamp(28px, 6vw, 70px)",
              marginTop: "42px",
            }}
          >
            <Stat
              label="Attack"
              value={sword.stats.atk}
              accent={accent}
              glow={glow}
            />
            {sword.stats.substat !== "—" && (
              <>
                <div
                  style={{
                    width: "1px",
                    background:
                      "linear-gradient(transparent, rgba(136,154,170,0.25), transparent)",
                  }}
                />
                <Stat
                  label="Substat"
                  value={sword.stats.substat}
                  accent={accent}
                  glow={glow}
                />
              </>
            )}
          </div>

          <div
            style={{
              marginTop: "52px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <span
              style={{
                fontSize: "0.6rem",
                letterSpacing: "5px",
                textTransform: "uppercase",
                color: "#4d5e72",
              }}
            >
              Its Story
            </span>
            <span style={{ fontSize: "16px", color: "#5a6c80", opacity: 0.7 }}>
              ↓
            </span>
          </div>
        </section>

        {/* Story */}
        <section style={{ position: "relative", padding: "14vh 24px 16vh" }}>
          <div
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              background:
                "radial-gradient(130% 75% at 18% 40%, rgba(5,10,20,0.9) 0%, rgba(5,10,20,0.66) 40%, rgba(5,10,20,0.18) 72%, transparent 100%)",
            }}
          />
          <div
            style={{
              position: "relative",
              maxWidth: "580px",
              margin: "0 clamp(20px, 9vw, 150px)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
                marginBottom: "30px",
              }}
            >
              <span
                style={{
                  width: "26px",
                  height: "1px",
                  display: "inline-block",
                  background: `linear-gradient(90deg, ${accent}b3, transparent)`,
                }}
              />
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "0.65rem",
                  letterSpacing: "5px",
                  textTransform: "uppercase",
                  color: "#5e7187",
                }}
              >
                What is Known
              </span>
            </div>
            {sword.story.map((para, i) => (
              <p
                key={i}
                style={{
                  margin: "0 0 26px",
                  fontFamily: "var(--font-body)",
                  fontWeight: 300,
                  fontStyle: "italic",
                  fontSize: "clamp(16px, 1.55vw, 21px)",
                  lineHeight: 1.85,
                  color: "#8b9cae",
                }}
              >
                {para}
              </p>
            ))}
          </div>
        </section>

        {/* Tagline */}
        <section
          style={{
            minHeight: "82vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 28px",
            textAlign: "center",
          }}
        >
          <p
            style={{
              margin: 0,
              maxWidth: "780px",
              fontFamily: "var(--font-body)",
              fontStyle: "italic",
              fontWeight: 300,
              fontSize: "clamp(22px, 3.2vw, 40px)",
              lineHeight: 1.5,
              color: "#d7e0ea",
              textShadow: `0 0 46px ${accent}${hex(0.4 * glow + 0.05)}`,
            }}
          >
            “{sword.tagline}”
          </p>
        </section>

        {/* Nav */}
        <footer
          style={{
            position: "relative",
            zIndex: 3,
            display: "grid",
            gridTemplateColumns: "1fr auto 1fr",
            alignItems: "center",
            gap: "18px",
            padding: "40px clamp(22px, 6vw, 70px) 56px",
            borderTop: "1px solid rgba(136,154,170,0.1)",
            background: "linear-gradient(transparent, rgba(5,10,20,0.85))",
          }}
        >
          <Link
            to={`/sword/${prev.slug}`}
            style={{
              textDecoration: "none",
              display: "inline-flex",
              flexDirection: "column",
              gap: "7px",
              justifySelf: "start",
            }}
          >
            <span
              style={{
                fontSize: "0.6rem",
                letterSpacing: "3px",
                textTransform: "uppercase",
                color: "#4f6175",
              }}
            >
              ← Previous
            </span>
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(15px, 1.8vw, 20px)",
                letterSpacing: "0.06em",
                color: "#b9c6d4",
              }}
            >
              {prev.name}
            </span>
          </Link>
          <Link
            to="/collection"
            style={{
              textDecoration: "none",
              justifySelf: "center",
              fontFamily: "var(--font-display)",
              fontSize: "0.65rem",
              letterSpacing: "5px",
              textTransform: "uppercase",
              color: "#6f8295",
              textAlign: "center",
            }}
          >
            All Ten
          </Link>
          <Link
            to={`/sword/${next.slug}`}
            style={{
              textDecoration: "none",
              display: "inline-flex",
              flexDirection: "column",
              gap: "7px",
              alignItems: "flex-end",
              justifySelf: "end",
              textAlign: "right",
            }}
          >
            <span
              style={{
                fontSize: "0.6rem",
                letterSpacing: "3px",
                textTransform: "uppercase",
                color: "#4f6175",
              }}
            >
              Next →
            </span>
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(15px, 1.8vw, 20px)",
                letterSpacing: "0.06em",
                color: "#b9c6d4",
              }}
            >
              {next.name}
            </span>
          </Link>
        </footer>
      </div>
    </div>
  );
}

function Stat({ label, value, accent, glow }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "8px",
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: "clamp(32px, 4.4vw, 54px)",
          color: "#eef3f9",
          lineHeight: 1,
          textShadow: `0 0 26px ${accent}${hex(0.32 * glow)}`,
        }}
      >
        {value}
      </span>
      <span
        style={{
          fontSize: "0.6rem",
          letterSpacing: "4px",
          textTransform: "uppercase",
          color: "#5d6f82",
        }}
      >
        {label}
      </span>
    </div>
  );
}
