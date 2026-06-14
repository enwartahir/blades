import { Link } from "react-router-dom";
import { SWORDS, ELEMENT_COLORS, ELEMENT_ICONS } from "../data/swords";

export default function CollectionPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        color: "var(--text-secondary)",
        fontFamily: "var(--font-body)",
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "30px clamp(22px, 5vw, 56px) 0",
        }}
      >
        <Link
          to="/"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "0.75rem",
            letterSpacing: "5px",
            textTransform: "uppercase",
            color: "#b9c6d4",
            textDecoration: "none",
          }}
        >
          Teyvat Blades
        </Link>
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "0.62rem",
            letterSpacing: "4px",
            textTransform: "uppercase",
            color: "#4f6072",
          }}
        >
          Ten Kept
        </span>
      </header>

      <section
        style={{
          textAlign: "center",
          padding:
            "clamp(70px, 13vh, 150px) clamp(22px, 5vw, 56px) clamp(48px, 8vh, 84px)",
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "0.62rem",
            letterSpacing: "6px",
            textTransform: "uppercase",
            color: "#5e7187",
            marginBottom: "26px",
          }}
        >
          An Armory of Ten
        </div>
        <h1
          style={{
            margin: 0,
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            color: "#f1f5fa",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            lineHeight: 1.02,
            fontSize: "clamp(40px, 8vw, 92px)",
          }}
        >
          The Collection
        </h1>
        <p
          style={{
            margin: "32px auto 0",
            maxWidth: "560px",
            fontFamily: "var(--font-body)",
            fontStyle: "italic",
            fontWeight: 300,
            fontSize: "clamp(15px, 1.7vw, 20px)",
            lineHeight: 1.7,
            color: "var(--text-secondary)",
          }}
        >
          Ten blades, each kept alone in its own dark, each lit by nothing but
          itself. Step toward one.
        </p>
      </section>

      <main
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))",
          gap: "18px",
          maxWidth: "1180px",
          margin: "0 auto",
          padding: "0 clamp(22px, 5vw, 56px) 90px",
        }}
      >
        {SWORDS.map((sword, i) => {
          const color = ELEMENT_COLORS[sword.element];
          return (
            <Link
              key={sword.slug}
              to={`/sword/${sword.slug}`}
              style={{
                position: "relative",
                display: "flex",
                flexDirection: "column",
                textDecoration: "none",
                color: "inherit",
                border: "1px solid rgba(136,154,170,0.12)",
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.018), rgba(255,255,255,0))",
                overflow: "hidden",
                transition:
                  "transform 0.5s cubic-bezier(.2,.7,.2,1), border-color 0.5s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = `${color}55`;
                e.currentTarget.style.transform = "translateY(-5px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(136,154,170,0.12)";
                e.currentTarget.style.transform = "none";
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "14px",
                  left: "16px",
                  fontFamily: "var(--font-display)",
                  fontSize: "0.65rem",
                  letterSpacing: "2px",
                  color: "#3f4f62",
                  zIndex: 2,
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </div>
              <div
                style={{
                  position: "absolute",
                  top: "17px",
                  right: "16px",
                  width: "7px",
                  height: "7px",
                  borderRadius: "50%",
                  background: color,
                  boxShadow: `0 0 8px ${color}, 0 0 16px ${color}88`,
                  zIndex: 2,
                }}
              />

              <div
                style={{
                  position: "relative",
                  aspectRatio: "1 / 1",
                  background: `radial-gradient(60% 60% at 50% 55%, ${color}22, transparent 75%)`,
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "2.4rem",
                    opacity: 0.6,
                  }}
                >
                  {ELEMENT_ICONS[sword.element]}
                </div>
                <img
                  src={`/thumbnails/${sword.slug}.png`}
                  alt={sword.name}
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                  }}
                />
              </div>

              <div style={{ padding: "20px 18px 24px", textAlign: "center" }}>
                <h3
                  style={{
                    margin: 0,
                    fontFamily: "var(--font-display)",
                    fontWeight: 700,
                    fontSize: "clamp(18px, 2vw, 22px)",
                    letterSpacing: "0.05em",
                    color: "#e7edf4",
                    lineHeight: 1.15,
                  }}
                >
                  {sword.name}
                </h3>
                <div style={{ marginTop: "10px" }}>
                  {Array.from({ length: 5 }, (_, s) => (
                    <span
                      key={s}
                      style={{
                        color: s < sword.rarity ? "#ffcc44" : "#2a3a44",
                        fontSize: "0.85rem",
                      }}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <div
                  style={{
                    marginTop: "12px",
                    fontSize: "0.66rem",
                    letterSpacing: "3px",
                    textTransform: "uppercase",
                    color,
                  }}
                >
                  {sword.element}
                </div>
                <div
                  style={{
                    marginTop: "6px",
                    fontSize: "0.7rem",
                    letterSpacing: "1px",
                    color: "#566779",
                  }}
                >
                  {sword.origin} — {sword.era}
                </div>
              </div>
            </Link>
          );
        })}
      </main>

      <footer
        style={{
          borderTop: "1px solid rgba(136,154,170,0.1)",
          padding: "40px 0 64px",
          textAlign: "center",
        }}
      >
        <p
          style={{
            margin: 0,
            fontFamily: "var(--font-body)",
            fontStyle: "italic",
            fontWeight: 300,
            fontSize: "clamp(15px, 1.8vw, 19px)",
            color: "#5d6f82",
          }}
        >
          Each blade turns whether or not anyone is there to watch.
        </p>
      </footer>
    </div>
  );
}
