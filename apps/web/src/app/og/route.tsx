import { ImageResponse } from "next/og";
import { NextResponse } from "next/server";

export const runtime = "edge";

const BG_PATH = "../../../../backgroundlogo.png";
const PROFILE_PATH = "../../../../profilepic.jpeg";
const WIDTH = 1200;
const HEIGHT = 630;
const PROFILE_SIZE = 320;
const BG_COLOR = "#18181b"; // fallback color, matches dark site bg

export async function GET() {
  try {
    // Try to load both images
    const [bgRes, profileRes] = await Promise.all([
      fetch(new URL(BG_PATH, import.meta.url)),
      fetch(new URL(PROFILE_PATH, import.meta.url)),
    ]);
    const bgOk = bgRes.ok;
    const profileOk = profileRes.ok;
    const bgArray = bgOk ? await bgRes.arrayBuffer() : null;
    const profileArray = profileOk ? await profileRes.arrayBuffer() : null;

    // If both images are available, composite them
    if (bgArray && profileArray) {
      return new ImageResponse(
        <div
          style={{
            width: WIDTH,
            height: HEIGHT,
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: `url('data:image/png;base64,${Buffer.from(bgArray).toString("base64")}', cover)`,
          }}
        >
          <img
            src={`data:image/jpeg;base64,${Buffer.from(profileArray).toString("base64")}`}
            width={PROFILE_SIZE}
            height={PROFILE_SIZE}
            style={{
              borderRadius: "50%",
              objectFit: "cover",
              boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
              border: "8px solid white",
              background: "white",
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
            }}
            alt="Lawrence Hua"
          />
        </div>,
        {
          width: WIDTH,
          height: HEIGHT,
        },
      );
    }

    // Fallback: just profile pic on solid background
    if (profileArray) {
      return new ImageResponse(
        <div
          style={{
            width: WIDTH,
            height: HEIGHT,
            background: BG_COLOR,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          <img
            src={`data:image/jpeg;base64,${Buffer.from(profileArray).toString("base64")}`}
            width={PROFILE_SIZE}
            height={PROFILE_SIZE}
            style={{
              borderRadius: "50%",
              objectFit: "cover",
              boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
              border: "8px solid white",
              background: "white",
            }}
            alt="Lawrence Hua"
          />
        </div>,
        {
          width: WIDTH,
          height: HEIGHT,
        },
      );
    }

    // If all fails, fallback to a blank image
    return new ImageResponse(
      <div
        style={{
          width: WIDTH,
          height: HEIGHT,
          background: BG_COLOR,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontSize: 48,
        }}
      >
        Lawrence Hua
      </div>,
      {
        width: WIDTH,
        height: HEIGHT,
      },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to generate image" },
      { status: 500 },
    );
  }
}
