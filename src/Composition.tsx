import { AbsoluteFill, useCurrentFrame, interpolate, useVideoConfig, Sequence } from "remotion";
import scriptData from "./script.json";

export const ShortComposition = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Rule 6: Only smooth zooms, no sudden jumps
  const scale = interpolate(frame, [0, 450], [1, 1.12], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#0b0f19", overflow: "hidden", fontFamily: "system-ui, sans-serif" }}>
      {/* Dynamic Background with smooth slow zoom */}
      <AbsoluteFill
        style={{
          transform: `scale(${scale})`,
          background: "radial-gradient(circle at center, #1e293b 0%, #0f172a 100%)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {/* Rule 3: Clean motion graphics / icon placeholder element */}
        <div style={{
          position: "absolute",
          top: "220px",
          width: "120px",
          height: "120px",
          borderRadius: "30px",
          background: "linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)",
          boxShadow: "0 20px 40px rgba(56, 189, 248, 0.3)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: "56px"
        }}>
          💡
        </div>
      </AbsoluteFill>

      {/* Rule 2 & 4: Bold animated text inside YouTube Safe Zone */}
      {scriptData.lines.map((line, index) => {
        const startFrame = line.start * fps;
        const endFrame = line.end * fps;
        const duration = endFrame - startFrame;

        if (frame < startFrame || frame > endFrame) return null;

        const opacity = interpolate(
          frame,
          [startFrame, startFrame + 6, endFrame - 6, endFrame],
          [0, 1, 1, 0],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );

        const translateY = interpolate(
          frame,
          [startFrame, startFrame + 8],
          [30, 0],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );

        return (
          <Sequence key={index} from={startFrame} durationInFrames={duration}>
            <AbsoluteFill
              style={{
                justifyContent: "center",
                alignItems: "center",
                padding: "0 100px",
                textAlign: "center",
                // Rule 4: Keeps text in YouTube safe zone (clears bottom caption and right action bar areas)
                bottom: "120px",
                top: "auto",
                height: "400px",
              }}
            >
              <h2
                style={{
                  color: "#ffffff",
                  fontSize: "58px",
                  fontWeight: 900,
                  lineHeight: "1.3",
                  textTransform: "uppercase",
                  textShadow: "0px 6px 25px rgba(0,0,0,0.85)",
                  opacity: opacity,
                  transform: `translateY(${translateY}px)`,
                }}
              >
                {line.text}
              </h2>
            </AbsoluteFill>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
