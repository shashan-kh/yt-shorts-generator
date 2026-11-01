import { AbsoluteFill, useCurrentFrame, interpolate, useVideoConfig, Sequence } from "remotion";
import scriptData from "./script.json";

export const ShortComposition = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Smooth slow continuous zoom throughout the whole video
  const scale = interpolate(frame, [0, durationInFrames], [1, 1.15], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#0b0f19", overflow: "hidden", fontFamily: "system-ui, sans-serif" }}>
      {/* Dynamic Background */}
      <AbsoluteFill
        style={{
          transform: `scale(${scale})`,
          background: "radial-gradient(circle at center, #1e293b 0%, #0f172a 100%)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {/* Icon / Graphic Container */}
        <div style={{
          position: "absolute",
          top: "240px",
          width: "130px",
          height: "130px",
          borderRadius: "35px",
          background: "linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)",
          boxShadow: "0 25px 50px rgba(56, 189, 248, 0.35)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: "60px"
        }}>
          💡
        </div>
      </AbsoluteFill>

      {/* Timed Bold Animated Captions inside YouTube Safe Zone */}
      {scriptData.lines.map((line, index) => {
        const startFrame = line.start;
        const endFrame = line.end;
        const duration = endFrame - startFrame;

        if (frame < startFrame || frame > endFrame) return null;

        const opacity = interpolate(
          frame,
          [startFrame, startFrame + 8, endFrame - 8, endFrame],
          [0, 1, 1, 0],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );

        const translateY = interpolate(
          frame,
          [startFrame, startFrame + 10],
          [40, 0],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );

        return (
          <Sequence key={index} from={startFrame} durationInFrames={duration}>
            <AbsoluteFill
              style={{
                justifyContent: "center",
                alignItems: "center",
                padding: "0 90px",
                textAlign: "center",
                // Positioned safely in the middle-lower YouTube safe zone
                bottom: "140px",
                top: "auto",
                height: "500px",
              }}
            >
              <h2
                style={{
                  color: "#ffffff",
                  fontSize: "52px",
                  fontWeight: 900,
                  lineHeight: "1.35",
                  textTransform: "uppercase",
                  textShadow: "0px 8px 30px rgba(0,0,0,0.9)",
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
