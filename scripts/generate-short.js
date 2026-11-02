import fs from "fs";
import { execSync } from "child_process";

async function postIssueComment(markdownMessage) {
  const githubRepo = process.env.GITHUB_REPOSITORY;
  const eventPath = process.env.GITHUB_EVENT_PATH;
  const token = process.env.GITHUB_TOKEN;

  if (!githubRepo || !eventPath || !token || !fs.existsSync(eventPath)) return;

  try {
    const eventData = JSON.parse(fs.readFileSync(eventPath, "utf8"));
    const issueNumber = eventData.issue?.number;
    if (!issueNumber) return;

    await fetch(`https://api.github.com/repos/${githubRepo}/issues/${issueNumber}/comments`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "User-Agent": "YT-Shorts-Generator-Bot",
      },
      body: JSON.stringify({ body: markdownMessage }),
    });
  } catch (err) {
    console.warn("Could not post comment to GitHub Issue:", err.message);
  }
}

function buildFallbackComposition(segments, totalDurationInFrames) {
  return `import React from "react";
import { AbsoluteFill, Sequence, Audio, useCurrentFrame, useVideoConfig, interpolate, spring, staticFile } from "remotion";

const SEGMENTS = ${JSON.stringify(segments, null, 2)};

const SceneGraphic: React.FC<{ index: number; frame: number; fps: number }> = ({ index, frame, fps }) => {
  const pop = spring({ frame, fps, config: { damping: 12, stiffness: 120 } });
  const floatY = Math.sin(frame / 10) * 10;
  const iconType = index % 5;

  return (
    <div style={{ transform: \`scale(\${pop}) translateY(\${floatY}px)\`, width: 240, height: 240, display: "flex", justifyContent: "center", alignItems: "center", background: "rgba(56, 189, 248, 0.1)", borderRadius: "48px", border: "3px solid rgba(56, 189, 248, 0.4)", boxShadow: "0 20px 60px rgba(56, 189, 248, 0.25)" }}>
      <svg width="150" height="150" viewBox="0 0 100 100" fill="none">
        {iconType === 0 && (
          <>
            <circle cx="50" cy="50" r="38" stroke="#38bdf8" strokeWidth="6" strokeDasharray="18 10" />
            <path d="M32 52L45 65L70 36" stroke="#facc15" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
          </>
        )}
        {iconType === 1 && (
          <>
            <path d="M50 82C50 82 18 62 18 36C18 23 28 14 40 14C47 14 50 20 50 20C50 20 53 14 60 14C72 14 82 23 82 36C82 62 50 82 50 82Z" stroke="#f43f5e" strokeWidth="6" fill="rgba(244, 63, 94, 0.2)" />
            <polyline points="26,46 42,46 48,32 55,60 62,46 74,46" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          </>
        )}
        {iconType === 2 && (
          <>
            <polyline points="15,78 38,52 58,34 85,34" stroke="#38bdf8" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="58" cy="34" r="8" fill="#facc15" />
            <circle cx="85" cy="34" r="8" fill="#facc15" />
            <line x1="15" y1="84" x2="85" y2="84" stroke="#64748b" strokeWidth="5" strokeLinecap="round" />
          </>
        )}
        {iconType === 3 && (
          <>
            <circle cx="50" cy="50" r="38" stroke="#facc15" strokeWidth="6" fill="rgba(250, 204, 21, 0.12)" />
            <polyline points="50,26 50,50 68,62" stroke="#ffffff" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
          </>
        )}
        {iconType === 4 && (
          <>
            <polygon points="50,12 61,36 88,39 68,57 73,84 50,70 27,84 32,57 12,39 39,36" stroke="#facc15" strokeWidth="6" fill="rgba(250, 204, 21, 0.25)" strokeLinejoin="round" />
          </>
        )}
      </svg>
    </div>
  );
};

const SegmentScene: React.FC<{ seg: typeof SEGMENTS[0] }> = ({ seg }) => {
  const localFrame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = seg.text.split(/\\s+/);
  const activeWordIndex = Math.min(words.length - 1, Math.floor((localFrame / seg.durationInFrames) * words.length));

  return (
    <AbsoluteFill style={{ paddingTop: 240, paddingBottom: 340, paddingLeft: 90, paddingRight: 130, justifyContent: "space-between", alignItems: "center" }}>
      <Audio src={staticFile(seg.audioFile)} volume={1.0} />
      <Audio src={staticFile("sfx.mp3")} volume={0.12} />

      <div style={{ marginTop: 40 }}>
        <SceneGraphic index={seg.index} frame={localFrame} fps={fps} />
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "center", gap: "16px", marginBottom: 60 }}>
        {words.map((word, wIdx) => {
          const isActive = wIdx === activeWordIndex;
          const isPast = wIdx < activeWordIndex;
          return (
            <span
              key={wIdx}
              style={{
                fontSize: "58px",
                fontWeight: 900,
                fontFamily: "system-ui, -apple-system, sans-serif",
                textTransform: "uppercase",
                color: isActive ? "#facc15" : isPast ? "#ffffff" : "rgba(255,255,255,0.65)",
                transform: isActive ? "scale(1.14)" : "scale(1)",
                transition: "transform 0.1s ease",
                textShadow: isActive ? "0 8px 30px rgba(250, 204, 21, 0.6)" : "0 6px 20px rgba(0,0,0,0.85)",
                display: "inline-block",
              }}
            >
              {word}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export const ShortComposition: React.FC = () => {
  const frame = useCurrentFrame();
  const smoothZoom = interpolate(frame, [0, ${totalDurationInFrames}], [1, 1.12], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor: "#090d16", overflow: "hidden" }}>
      <Audio src={staticFile("bg-music.mp3")} volume={0.07} />
      <AbsoluteFill style={{ transform: \`scale(\${smoothZoom})\`, background: "radial-gradient(circle at 50% 35%, #1e293b 0%, #090d16 75%)" }}>
        {SEGMENTS.map((seg) => (
          <Sequence key={seg.index} from={seg.startFrame} durationInFrames={seg.durationInFrames}>
            <SegmentScene seg={seg} />
          </Sequence>
        ))}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
`;
}

async function run() {
  const rawComment = process.env.COMMENT_BODY || "";
  const scriptText =
    rawComment.replace("/create-short", "").trim() ||
    "Stop trying to hit 10,000 steps. Doctors say it's not the number that matters. Large studies found the health benefits start climbing well before 10,000, and they begin to level off around 7,000 steps a day. That's roughly 30 to 40 minutes of walking. But here's the trick almost nobody uses: walk for just 10 minutes after your biggest meal. It helps your body handle the sugar spike from that meal, which is better for your energy and your heart. So your plan is simple. Seven thousand steps a day. Ten minutes after dinner. That's it. No gym, no app, no money. Save this, and tonight after dinner, go for a walk. Want to know why 10,000 steps became the standard in the first place? It wasn't science...";

  console.log(`Processing script: "${scriptText}"`);
  fs.mkdirSync("public", { recursive: true });

  const sentences = scriptText.match(/[^.!?]+[.!?]+|\s*[^.!?]+$/g) || [scriptText];
  const fps = 30;
  let currentFrame = 0;
  const segments = [];

  console.log("1. Generating Neural Voiceovers via Microsoft Edge-TTS...");
  sentences.forEach((s, i) => {
    const cleanText = s.trim();
    if (!cleanText) return;

    const fileName = `vo_${i}.mp3`;
    const filePath = `public/${fileName}`;

    fs.writeFileSync("temp_tts.txt", cleanText);
    execSync(`python3 -m edge_tts --voice en-US-ChristopherNeural --rate=+5% -f temp_tts.txt --write-media ${filePath}`);

    const durationStr = execSync(
      `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 ${filePath}`
    )
      .toString()
      .trim();
    const durationSec = parseFloat(durationStr) || 3;
    const durationFrames = Math.ceil(durationSec * fps);

    segments.push({
      index: i,
      text: cleanText,
      audioFile: fileName,
      startFrame: currentFrame,
      durationInFrames: durationFrames,
      endFrame: currentFrame + durationFrames,
    });

    currentFrame += durationFrames;
  });

  if (fs.existsSync("temp_tts.txt")) fs.unlinkSync("temp_tts.txt");

  const totalDurationInFrames = Math.max(90, currentFrame + 30);
  const totalSeconds = Math.ceil(totalDurationInFrames / fps);

  console.log("2. Synthesizing Background Music & Sound Effects via FFmpeg...");
  execSync(
    `ffmpeg -y -f lavfi -i "sine=frequency=110:duration=${totalSeconds}" -f lavfi -i "sine=frequency=165:duration=${totalSeconds}" -filter_complex "[0:a][1:a]amix=inputs=2:duration=first,lowpass=f=280,volume=0.05" public/bg-music.mp3`
  );

  execSync(
    `ffmpeg -y -f lavfi -i "sine=frequency=520:duration=0.12" -af "afade=t=in:ss=0:d=0.02,afade=t=out:st=0.04:d=0.08,volume=0.14" public/sfx.mp3`
  );

  fs.writeFileSync("src/meta.json", JSON.stringify({ durationInFrames: totalDurationInFrames, segments }, null, 2));

  console.log("3. Discovering available Gemini models via ListModels API...");
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing from GitHub Actions Secrets!");
  }

  let candidateModels = ["gemini-3.8-flash"];
  try {
    const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    if (listRes.ok) {
      const listData = await listRes.json();
      const supported = (listData.models || [])
        .filter(
          (m) =>
            m.supportedGenerationMethods?.includes("generateContent") &&
            m.name.includes("gemini") &&
            !m.name.includes("embedding") &&
            !m.name.includes("vision") &&
            !m.name.includes("imagen") &&
            !m.name.includes("tts")
        )
        .map((m) => m.name.replace("models/", ""));

      // Prioritize flash models first for speed, then pro models
      const flashModels = supported.filter((m) => m.includes("flash"));
      const proModels = supported.filter((m) => m.includes("pro"));
      candidateModels = [...new Set(["gemini-3.8-flash", ...flashModels, ...proModels])].slice(0, 5);
      console.log("Discovered active fallback models:", candidateModels.join(", "));
    }
  } catch (e) {
    console.warn("Could not list models dynamically, using default:", e.message);
  }

  const userPrompt = `Create Youtube shorts video by using the video script provided. Here is my exact script: ${scriptText}

Edit it in Remotion like a premium Youtube shorts:
1. Keep voice over of video clear.
2. Add bold animated text for the all the words, matched to when the voice over of that is said or appeared.
3. Add clean motion graphics and icons that explain the voice over.
4. Keep everything inside the Youtube safe zone (not too high, not near the bottom captions area).
5. Add soft sound effects (very low) and one low background music track.
6. Only smooth zooms, no sudden jumps.

---
STRICT TECHNICAL REQUIREMENTS FOR REMOTION CODE:
Output ONLY raw, valid TypeScript React code for \`src/Composition.tsx\`. Do NOT include markdown \`\`\`tsx fences or any text outside the code.
- Must start with:
  import React from "react";
  import { AbsoluteFill, Sequence, Audio, useCurrentFrame, useVideoConfig, interpolate, spring, staticFile } from "remotion";
- Must export: \`export const ShortComposition: React.FC = () => { ... };\`
- Do NOT import any external icon libraries.
- Embed this exact voiceover timing array as a constant inside the file (total video frames: ${totalDurationInFrames} at 30 fps):
const SEGMENTS = ${JSON.stringify(segments)};

- Audio Rules (Rules 1 & 5):
  - At the root inside \`<AbsoluteFill>\`, render \`<Audio src={staticFile("bg-music.mp3")} volume={0.07} />\`.
  - Map over \`SEGMENTS\` and render a \`<Sequence key={seg.index} from={seg.startFrame} durationInFrames={seg.durationInFrames}>\`.
  - Inside each Sequence, render \`<Audio src={staticFile(seg.audioFile)} volume={1.0} />\` and \`<Audio src={staticFile("sfx.mp3")} volume={0.12} />\`.
- Word-by-Word Animated Text (Rule 2):
  - Split \`seg.text.split(" ")\` into words. Using \`const localFrame = useCurrentFrame();\`, compute \`const activeWordIndex = Math.min(words.length - 1, Math.floor((localFrame / seg.durationInFrames) * words.length));\`.
  - Render all words of the sentence in a centered flex-wrap container, highlighting the active word in \`#facc15\` with \`transform: scale(1.12)\`.
- Clean SVG Motion Graphics (Rule 3):
  - Keep the code concise! Create a clean component \`SceneGraphic\` using simple geometric SVG shapes (\`<circle>\`, \`<rect>\`, \`<polyline>\`, \`<path>\`) switched by \`seg.index % 6\` with \`spring\` scale animations so the code generates quickly.
- Safe Zone & Smooth Zoom (Rules 4 & 6):
  - Keep all graphics and text strictly inside \`paddingTop: 240, paddingBottom: 340, paddingLeft: 90, paddingRight: 130\`.
  - Apply a continuous slow zoom \`interpolate(frame, [0, ${totalDurationInFrames}], [1, 1.12])\` with zero sudden jumps.`;

  let generatedCode = "";
  let usedModel = "";
  const errorLogs = [];

  for (const model of candidateModels) {
    try {
      console.log(`Trying model: ${model} (timeout: 180s)...`);
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: userPrompt }] }],
            generationConfig: { temperature: 0.2 },
          }),
          signal: AbortSignal.timeout(180000),
        }
      );

      if (res.ok) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
        const cleaned = text.replace(/^```[a-zA-Z]*\n/, "").replace(/\n```$/, "").trim();
        if (cleaned.includes("ShortComposition")) {
          generatedCode = cleaned;
          usedModel = model;
          console.log(`Successfully generated Remotion code using model: ${model}`);
          break;
        } else {
          errorLogs.push(`${model}: Returned incomplete code without ShortComposition`);
        }
      } else {
        const errBody = await res.text();
        console.warn(`Model ${model} failed (${res.status}): ${errBody}`);
        errorLogs.push(`${model} (HTTP ${res.status}): ${errBody.slice(0, 180)}`);
      }
    } catch (err) {
      console.warn(`Model ${model} threw error: ${err.message}`);
      errorLogs.push(`${model}: ${err.message}`);
    }
  }

  if (generatedCode) {
    fs.writeFileSync("src/Composition.tsx", generatedCode);
    // Validate that Gemini's generated TSX compiles cleanly before rendering
    try {
      console.log("Validating Gemini-generated TSX with Remotion bundler...");
      execSync("npx remotion bundle src/index.ts out/bundle-test", { stdio: "pipe" });
      fs.rmSync("out/bundle-test", { recursive: true, force: true });
      console.log("Validation passed!");
    } catch (bundleErr) {
      console.warn("Gemini TSX had a syntax error, switching to built-in Premium Remotion engine:", bundleErr.message);
      errorLogs.push(`TSX Compiler check on ${usedModel} failed; auto-repaired with built-in engine.`);
      fs.writeFileSync("src/Composition.tsx", buildFallbackComposition(segments, totalDurationInFrames));
    }
  } else {
    console.warn("All Gemini models timed out or hit rate limits. Using built-in Premium Remotion engine so video still renders!");
    fs.writeFileSync("src/Composition.tsx", buildFallbackComposition(segments, totalDurationInFrames));
    await postIssueComment(
      `⚠️ **Gemini API Notice (Video Still Rendering!)**\n\nThe Gemini API models encountered timeouts or rate limits:\n\`\`\`text\n${errorLogs.join("\n")}\n\`\`\`\n\n✅ **Auto-Recovery Activated:** Your voiceovers, background music, sound effects, word-by-word animated captions, and custom SVG motion graphics have been compiled using the built-in Remotion template so your video build completes without failing.`
    );
  }
}

run().catch(async (err) => {
  console.error("Fatal Workflow Error:", err.message);
  await postIssueComment(`❌ **YouTube Short Generation Failed**\n\n\`\`\`text\n${err.message}\n\`\`\``);
  process.exit(1);
});
