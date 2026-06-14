import { useState } from "react";
import { Link } from "react-router-dom";
import { SWORDS } from "../data/swords";
import SwordViewer from "../components/SwordViewer";

export default function ThumbnailGenerator() {
  const [idx, setIdx] = useState(0);
  const sword = SWORDS[idx];

  const save = () => {
    const canvas = document.querySelector("canvas");
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `${sword.slug}.png`;
    a.click();
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        color: "var(--text-secondary)",
        fontFamily: "var(--font-body)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "24px",
        padding: "40px 20px",
      }}
    >
      <p
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "0.7rem",
          letterSpacing: "4px",
          textTransform: "uppercase",
          color: "#5e7187",
          textAlign: "center",
          maxWidth: "440px",
        }}
      >
        Dev tool — render each sword once, save the PNG, drop it into
        /public/thumbnails/&lt;slug&gt;.png for the collection grid.
      </p>

      <div
        style={{
          width: "512px",
          height: "512px",
          maxWidth: "90vw",
          maxHeight: "90vw",
          border: "1px solid rgba(136,154,170,0.15)",
        }}
      >
        <SwordViewer key={sword.slug} sword={sword} transparent />
      </div>

      <div
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "1.1rem",
          letterSpacing: "0.06em",
          color: "#e7edf4",
          textTransform: "uppercase",
        }}
      >
        {sword.name}
      </div>
      <div
        style={{ fontSize: "0.7rem", letterSpacing: "2px", color: "#5d6f82" }}
      >
        {idx + 1} / {SWORDS.length} — saves as {sword.slug}.png
      </div>

      <div style={{ display: "flex", gap: "16px" }}>
        <button
          onClick={() => setIdx((i) => (i - 1 + SWORDS.length) % SWORDS.length)}
          style={btnStyle}
        >
          ← Prev
        </button>
        <button
          onClick={save}
          style={{
            ...btnStyle,
            borderColor: "rgba(68,136,255,0.5)",
            color: "#88aaff",
          }}
        >
          Save PNG
        </button>
        <button
          onClick={() => setIdx((i) => (i + 1) % SWORDS.length)}
          style={btnStyle}
        >
          Next →
        </button>
      </div>

      <Link
        to="/collection"
        style={{
          color: "#6f8295",
          fontSize: "0.75rem",
          letterSpacing: "2px",
          textTransform: "uppercase",
          textDecoration: "none",
        }}
      >
        ← Back to Collection
      </Link>
    </div>
  );
}

const btnStyle = {
  background: "transparent",
  border: "1px solid rgba(136,154,170,0.3)",
  color: "#889aaa",
  padding: "10px 22px",
  cursor: "pointer",
  fontFamily: "var(--font-body)",
  fontSize: "0.75rem",
  letterSpacing: "2px",
  textTransform: "uppercase",
};

const btnStyleSpread = { ...btnStyle };
