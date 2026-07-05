import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0056D2",
          borderRadius: 40,
        }}
      >
        <span
          style={{
            color: "#FFFFFF",
            fontSize: 110,
            fontWeight: 900,
            fontFamily: "Arial, Helvetica, sans-serif",
          }}
        >
          N
        </span>
      </div>
    ),
    { width: 192, height: 192 }
  );
}
