import { ImageResponse } from "next/og";

// iOS applies its own corner mask to apple-touch-icons, so this ships as a
// plain filled square (no border-radius) — matching app/icon.svg's colors
// and checkmark glyph, just rendered as a real PNG via Satori/ImageResponse
// instead of hand-authored SVG, since Apple doesn't accept SVG here.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#5b5bd6",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width="112" height="112" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M18 33.5 L27 42.5 L46 21.5"
            stroke="#ffffff"
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    ),
    { ...size }
  );
}
