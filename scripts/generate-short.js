import fs from "fs";
import { execSync } from "child_process";

async function run() {
  const rawComment = process.env.COMMENT_BODY || "";
  const scriptText =
    rawComment.replace("/create-short", "").trim() ||
    "Stop trying to hit 10,000 steps. Doctors say it's not the number that matters. Large studies found the health benefits start climbing well before 10,000, and they begin to level off around 7,000 steps a day. That's roughly 30 to 40 minutes of walking. But here's the trick almost nobody uses: walk for just 10 minutes after your biggest meal. It helps your body handle the sugar spike from that meal, which is better for your energy and your heart. So your plan is simple. Seven thousand steps a day. Ten minutes after dinner. That's it. No gym, no app, no money. Save this, and tonight after dinner, go for a walk. Want to know why 10,000 steps became the standard in the first place? It wasn't science...";

  console.log(`Processing script: "${scriptText}"`);

  fs.mkdirSync("public", { recursive: true });

  const sentences =
    scriptText.match(/[^.!?]+[.!?]+|\s*[^.!?]+$/g) || [scriptText];
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
    execSync(
      `python3 -m edge_tts --voice en-US-ChristopherNeural --rate=+5% -f temp_tts.txt --write-media ${filePath}`
    );

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

  fs.writeFileSync(
    "src/meta.json",
    JSON.stringify({ durationInFrames: totalDurationInFrames, segments }, null, 2)
  );

  console.log("3. Prompting Gemini API...");
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing from GitHub Actions Secrets!");
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
- Do NOT import any external icon libraries or external files. Create all bespoke SVG icons, glowing illustrations, progress bars, and motion graphics inline using standard JSX \`<svg>\`, \`<path>\`, \`<circle>\`, \`<rect>\`, etc.
- Embed this exact voiceover timing array as a constant inside the file (total video frames: ${totalDurationInFrames} at 30 fps):
const SEGMENTS = ${JSON.stringify(segments, null, 2)};

- Audio Rules (Rules 1 & 5):
  - At the root inside \`<AbsoluteFill>\`, render \`<Audio src={staticFile("bg-music.mp3")} volume={0.07} />\`.
  - Map over \`SEGMENTS\` and render a \`<Sequence key={seg.index} from={seg.startFrame} durationInFrames={seg.durationInFrames}>\` for each segment.
  - Inside each Sequence, render \`<Audio src={staticFile(seg.audioFile)} volume={1.0} />\` for the clear voiceover, and \`<Audio src={staticFile("sfx.mp3")} volume={0.12} />\` for the transition sound effect.
- Word-by-Word Animated Text (Rule 2):
  - Inside each segment component, split \`seg.text.split(" ")\` into words.
  - Using \`const localFrame = useCurrentFrame();\` (which starts at 0 inside a Sequence), compute which word index is currently active: \`const activeWordIndex = Math.min(words.length - 1, Math.floor((localFrame / seg.durationInFrames) * words.length));\`.
  - Render all words of the sentence together in a centered flex-wrap container, styling the active word with a vibrant highlight color (e.g. \`#facc15\` or \`#38bdf8\`) and a smooth scale pop (\`transform: scale(1.12)\`), while spoken/upcoming words remain bold white uppercase with strong drop shadow.
- Custom SVG Motion Graphics (Rule 3):
  - Create a helper component \`const SceneGraphic: React.FC<{ index: number; frame: number; fps: number }> = ({ index, frame, fps }) => { ... }\` that renders a different, rich, animated vector illustration/icon (260x260px) for each segment index matching the meaning of that sentence.
- Safe Zone & Smooth Zoom (Rules 4 & 6):
  - Keep all graphics and text strictly inside \`paddingTop: 240, paddingBottom: 340, paddingLeft: 90, paddingRight: 130\`.
  - Apply a continuous, gentle slow zoom to the background and scene wrapper with zero sudden jumps.`;

  const modelsToTry = ["gemini-3.8-flash", "gemini-pro"];
  let response = null;
  let usedModel = "";

  for (const model of modelsToTry) {
    try {
      console.log(`Trying model: ${model}...`);
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: userPrompt }] }],
            generationConfig: { temperature: 0.2 },
          }),
          signal: AbortSignal.timeout(90000),
        }
      );

      if (res.ok) {
        response = res;
        usedModel = model;
        console.log(`Successfully connected using model: ${model}`);
        break;
      } else {
        const errBody = await res.text();
        console.warn(`Model ${model} failed with status ${res.status}: ${errBody}`);
      }
    } catch (err) {
      console.warn(`Model ${model} threw error: ${err.message}`);
    }
  }

  if (!response) {
    throw new Error("All Gemini fallback models failed due to rate limits or network timeout. Please wait a minute and try again.");
  }

  const data = await response.json();
  let generatedCode =
    data.candidates?.[0]?.content?.parts?.[0]?.text || "";

  generatedCode = generatedCode
    .replace(/^```[a-zA-Z]*\n/, "")
    .replace(/\n```$/, "")
    .trim();

  if (!generatedCode.includes("ShortComposition")) {
    throw new Error(`Gemini (${usedModel}) did not return valid ShortComposition code.`);
  }

  fs.writeFileSync("src/Composition.tsx", generatedCode);
  console.log(`Successfully generated custom src/Composition.tsx via ${usedModel}!`);
}

run().catch(async (err) => {
  console.error("Workflow Execution Failed:", err.message);
  
  // If triggered by an issue comment, post the exact error message back to the GitHub Issue
  const githubRepo = process.env.GITHUB_REPOSITORY;
  const eventPath = process.env.GITHUB_EVENT_PATH;
  
  if (githubRepo && eventPath && fs.existsSync(eventPath)) {
    try {
      const eventData = JSON.parse(fs.readFileSync(eventPath, "utf8"));
      if (eventData.comment && eventData.issue) {
        const issueNumber = eventData.issue.number;
        const token = process.env.GITHUB_TOKEN;
        
        await fetch(`https://api.github.com/repos/${githubRepo}/issues/${issueNumber}/comments`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
            "User-Agent": "NodeJS-Action"
          },
          body: JSON.stringify({
            body: `❌ **YouTube Short Generation Failed**\n\n\`\`\`text\n${err.message}\n\`\`\`\n\n*(Please check your Gemini API rate limits or try again shortly)*`
          })
        });
      }
    } catch (commentErr) {
      console.error("Failed to post error comment to GitHub Issue:", commentErr.message);
    }
  }
  
  process.exit(1);
});
