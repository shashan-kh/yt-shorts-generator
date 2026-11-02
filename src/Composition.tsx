import React from "react";
import { AbsoluteFill, Sequence, Audio, useCurrentFrame, useVideoConfig, interpolate, spring, staticFile } from "remotion";

const SEGMENTS = [{"index":0,"text":"Stop trying to hit 10,000 steps.","audioFile":"vo_0.mp3","startFrame":0,"durationInFrames":97,"endFrame":97},{"index":1,"text":"Doctors say it's not the number that matters.","audioFile":"vo_1.mp3","startFrame":97,"durationInFrames":93,"endFrame":190},{"index":2,"text":"Large studies found the health benefits start climbing well before 10,000, and they begin to level off around 7,000 steps a day.","audioFile":"vo_2.mp3","startFrame":190,"durationInFrames":243,"endFrame":433},{"index":3,"text":"That's roughly 30 to 40 minutes of walking.","audioFile":"vo_3.mp3","startFrame":433,"durationInFrames":100,"endFrame":533},{"index":4,"text":"But here's the trick almost nobody uses: walk for just 10 minutes after your biggest meal.","audioFile":"vo_4.mp3","startFrame":533,"durationInFrames":170,"endFrame":703},{"index":5,"text":"It helps your body handle the sugar spike from that meal, which is better for your energy and your heart.","audioFile":"vo_5.mp3","startFrame":703,"durationInFrames":175,"endFrame":878},{"index":6,"text":"So your plan is simple.","audioFile":"vo_6.mp3","startFrame":878,"durationInFrames":70,"endFrame":948},{"index":7,"text":"Seven thousand steps a day.","audioFile":"vo_7.mp3","startFrame":948,"durationInFrames":79,"endFrame":1027},{"index":8,"text":"Ten minutes after dinner.","audioFile":"vo_8.mp3","startFrame":1027,"durationInFrames":65,"endFrame":1092},{"index":9,"text":"That's it.","audioFile":"vo_9.mp3","startFrame":1092,"durationInFrames":57,"endFrame":1149},{"index":10,"text":"No gym, no app, no money.","audioFile":"vo_10.mp3","startFrame":1149,"durationInFrames":93,"endFrame":1242},{"index":11,"text":"Save this, and tonight after dinner, go for a walk.","audioFile":"vo_11.mp3","startFrame":1242,"durationInFrames":122,"endFrame":1364},{"index":12,"text":"Want to know why 10,000 steps became the standard in the first place?","audioFile":"vo_12.mp3","startFrame":1364,"durationInFrames":135,"endFrame":1499},{"index":13,"text":"It wasn't science...","audioFile":"vo_13.mp3","startFrame":1499,"durationInFrames":63,"endFrame":1562}];

const SceneGraphic: React.FC<{ index: number; frame: number; fps: number }> = ({ index, frame, fps }) => {
  const spr = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 100 },
  });

  const type = index % 6;

  return (
    <div
      style={{
        width: 320,
        height: 320,
        margin: "0 auto 40px auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transform: `scale(${spr})`,
      }}
    >
      <svg width="320" height="320" viewBox="0 0 320 320" fill="none">
        {type === 0 && (
          // Stop / X graphic
          <g>
            <circle cx="160" cy="160" r="140" fill="#ef4444" fillOpacity="0.2" stroke="#ef4444" strokeWidth="8" />
            <path d="M110 110L210 210M210 110L110 210" stroke="#ef4444" strokeWidth="20" strokeLinecap="round" />
          </g>
        )}
        {type === 1 && (
          // Doctor / Cross / Check
          <g>
            <circle cx="160" cy="160" r="140" fill="#3b82f6" fillOpacity="0.2" stroke="#3b82f6" strokeWidth="8" />
            <rect x="130" y="90" width="60" height="140" rx="12" fill="#3b82f6" />
            <rect x="90" y="130" width="140" height="60" rx="12" fill="#3b82f6" />
          </g>
        )}
        {type === 2 && (
          // Chart / Steps 7000 vs 10000
          <g>
            <circle cx="160" cy="160" r="140" fill="#10b981" fillOpacity="0.2" stroke="#10b981" strokeWidth="8" />
            <rect x="90" y="160" width="40" height="80" rx="8" fill="#10b981" fillOpacity="0.5" />
            <rect x="140" y="100" width="40" height="140" rx="8" fill="#10b981" />
            <rect x="190" y="130" width="40" height="110" rx="8" fill="#10b981" fillOpacity="0.7" />
          </g>
        )}
        {type === 3 && (
          // Clock / Time
          <g>
            <circle cx="160" cy="160" r="140" fill="#f59e0b" fillOpacity="0.2" stroke="#f59e0b" strokeWidth="8" />
            <circle cx="160" cy="160" r="100" stroke="#f59e0b" strokeWidth="12" fill="none" />
            <path d="M160 100V160H200" stroke="#f59e0b" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        )}
        {type === 4 && (
          // Meal / Plate
          <g>
            <circle cx="160" cy="160" r="140" fill="#ec4899" fillOpacity="0.2" stroke="#ec4899" strokeWidth="8" />
            <circle cx="160" cy="160" r="80" stroke="#ec4899" strokeWidth="10" fill="none" />
            <path d="M130 160H190" stroke="#ec4899" strokeWidth="8" strokeLinecap="round" />
          </g>
        )}
        {type === 5 && (
          // Heart / Energy
          <g>
            <circle cx="160" cy="160" r="140" fill="#8b5cf6" fillOpacity="0.2" stroke="#8b5cf6" strokeWidth="8" />
            <path
              d="M160 215L138 193C110 165 92 147 92 124C92 105 107 90 126 90C137 90 148 95 160 106C172 95 183 90 194 90C213 90 228 105 228 124C228 147 210 165 182 193L160 215Z"
              fill="#8b5cf6"
            />
          </g>
        )}
      </svg>
    </div>
  );
};

export const ShortComposition: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = interpolate(frame, [0, 1592], [1, 1.12], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#09090b",
        fontFamily: "system-ui, -apple-system, sans-serif",
        overflow: "hidden",
      }}
    >
      {/* Background Music */}
      <Audio src={staticFile("bg-music.mp3")} volume={0.07} />

      {/* Main Container with smooth continuous zoom */}
      <AbsoluteFill
        style={{
          transform: `scale(${scale})`,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          paddingTop: 240,
          paddingBottom: 340,
          paddingLeft: 90,
          paddingRight: 130,
        }}
      >
        {SEGMENTS.map((seg) => {
          return (
            <Sequence
              key={seg.index}
              from={seg.startFrame}
              durationInFrames={seg.durationInFrames}
            >
              {/* Voice over and Sound effect */}
              <Audio src={staticFile(seg.audioFile)} volume={1.0} />
              <Audio src={staticFile("sfx.mp3")} volume={0.12} />

              <div
                style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {/* SVG Motion Graphic */}
                <SceneGraphic index={seg.index} frame={frame - seg.startFrame} fps={fps} />

                {/* Animated Word-by-Word Text */}
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    justifyContent: "center",
                    gap: "16px 12px",
                    maxWidth: "900px",
                  }}
                >
                  {(() => {
                    const words = seg.text.split(" ");
                    const localFrame = frame - seg.startFrame;
                    const activeWordIndex = Math.min(
                      words.length - 1,
                      Math.floor((localFrame / seg.durationInFrames) * words.length)
                    );

                    return words.map((word, i) => {
                      const isActive = i === activeWordIndex;
                      return (
                        <span
                          key={i}
                          style={{
                            fontSize: 52,
                            fontWeight: 800,
                            color: isActive ? "#facc15" : "#ffffff",
                            transform: isActive ? "scale(1.12)" : "scale(1)",
                            transition: "transform 0.15s ease, color 0.15s ease",
                            textShadow: "0 4px 12px rgba(0,0,0,0.8)",
                            display: "inline-block",
                          }}
                        >
                          {word}
                        </span>
                      );
                    });
                  })()}
                </div>
              </div>
            </Sequence>
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};