import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get("username") || "User";

  // In a real app we might fetch the actual progress here,
  // but usually OG generation is separate or we pass progress via params if we want it super dynamic.
  // For now, let's just make a cool static image with the name.

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0a0a0a",
          color: "white",
        }}
      >
        <div style={{ display: "flex", fontSize: 60, fontWeight: "bold" }}>
          {username}&apos;s Year
        </div>
        <div style={{ display: "flex", fontSize: 30, color: "#555", marginTop: 20 }}>
          Powered by Chronos
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
