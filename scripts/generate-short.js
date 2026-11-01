import fs from "fs";
import { execSync } from "child_process";
import { GoogleGenAI } from "@google/genai";

const rawComment = process.env.COMMENT_BODY || "";
const scriptText =
  rawComment.replace("/create-short", "").trim() ||
  "Stop trying to hit 10,000 steps. Doctors say it's not the number that matters. Large studies found the health benefits start climbing well before 10,000, and they begin to level off around 7,000 steps a day. That's roughly 30 to 40 minutes of walking. But here's the trick almost nobody uses: walk for just 10 minutes after your biggest meal. It helps your body handle the sugar spike from that meal, which is better for your energy and your heart. So your plan is simple. Seven thousand steps a day. Ten minutes after dinner. That's it. No gym, no app, no money. Save this, and tonight after dinner, go for a walk. Want to know why 10,000 steps became the standard in the first place? It wasn't science...";

console.log(`Processing script: "${scriptText}"`);

// Ensure public directory exists for audio assets
fs.mkdirSync("public", { recursive: true });

// Split script into sentences so every segment has exact voiceover sync
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

  // Escape quotes for bash safety
  const escaped = cleanText.replace(/"/g, '\\"');
  execSync(`edge-tts --voice en-US-ChristopherNeural --rate=+5% --text "${escaped}" --write-media ${filePath}`);

  // Get exact audio duration in seconds via ffprobe
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

// Add 1 second (30 frames) tail buffer
const totalDurationInFrames = Math.max(90, currentFrame + 30);
const totalSeconds = Math.ceil(totalDurationInFrames / fps);

console.log("2. Synthesizing Background Music & Sound Effects via FFmpeg...");
// Generate warm ambient background chord (C2 + G2)
execSync(
  `ffmpeg -y -f lavfi -i "sine=frequency=110:duration=${totalSeconds}" -f lavfi -i "sine=frequency=165:duration=${totalSeconds}" -filter_complex "[0:a][1:a]amix=inputs=2:duration=first,lowpass=f=300,volume=0.06" public/bg-music.mp3`
);

// Generate soft pop/whoosh sound effect for transitions
execSync(
  `ffmpeg -y -f lavfi -i "sine=frequency=520:duration=0.12" -af "afade=t=in:ss=0:d=0.02,afade=t=out:st=0.04:d=0.08,volume=0.15" public/sfx.mp3`
);

// Save total duration so Root.tsx knows the exact length of the video
fs.writeFileSync("src/meta.json", JSON.stringify({ durationInFrames: totalDurationInFrames, segments }, null, 2));

console.log("3. Prompting Gemini to generate custom Remotion code & SVG assets...");
if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is missing! Please add it to your repository's GitHub Actions Secrets.");
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const userPrompt = `Create Youtube shorts video by using the video script provided. Here is my exact script: ${scriptText}

Edit it in Remotion like a premium Youtube shorts:
1. Keep voice over of video clear.
2. Add bold animated text for the all the words, matched to when the voice over of that is said or appeared.
3. Add clean motion graphics and icons that explain the voice over.
4. Keep everything inside the Youtube safe zone (not too high, not near the bottom captions area).
5. Add soft sound effects (very low) and one low background music track.
6. Only smooth zooms, no sudden jumps.

---
TECHNICAL IMPLEMENTATION REQUIREMENTS FOR REMOTION:
You must output ONLY valid TypeScript React code for \`src/Composition.tsx\`. Do not wrap in markdown \`\`\`tsx fences or add explanations.
- Export \`const ShortComposition: React.FC = () => { ... }\`
- Import ONLY from \`"remotion"\` (\`AbsoluteFill\`, \`Sequence\`, \`Audio\`, \`useCurrentFrame\`, \`useVideoConfig\`, \`interpolate\`, \`spring\`, \`staticFile\`) and \`"react"\`. Do NOT import external icon libraries (create all required bespoke SVG icons, glowing shapes, and clean motion graphics directly inline in JSX!).
- Here is the exact pre-generated voiceover timing data (at 30 fps, total frames: ${totalDurationInFrames}):
${JSON.stringify(segments, null, 2)}

- For the Background Music (Rule 5): Include \`<Audio src={staticFile("bg-music.mp3")} volume={0.08} />\` at the root level.
- For each segment in the array:
  1. Render a \`<Sequence from={seg.startFrame} durationInFrames={seg.durationInFrames}>\`.
  2. Inside the Sequence, play the voiceover cleanly (Rule 1): \`<Audio src={staticFile(seg.audioFile)} volume={1.0} />\`.
  3. Play the soft sound effect on segment transition (Rule 5): \`<Audio src={staticFile("sfx.mp3")} volume={0.12} />\`.
  4. Rule 2 (Word-by-word bold animated text): Split \`seg.text\` into words and calculate each word's active frame window across \`seg.durationInFrames\`. Highlight the currently spoken word with a vibrant pop animation (scale + color highlight like #38bdf8 or #facc15) while showing the rest of the segment's words in bold uppercase white font with heavy drop shadow.
  5. Rule 3 (Custom Motion Graphics & Icons): Design a unique, custom animated SVG illustration/icon for EACH segment that visually represents what that sentence is talking about (e.g., footsteps, doctor/heart, chart leveling off at 7,000, dinner plate/clock, glowing checkmark, etc.), animated smoothly with \`spring\` or \`interpolate\`.
  6. Rule 4 (YouTube Safe Zone): Keep all text and graphics strictly inside \`top: 220px\` to \`bottom: 320px\` and \`paddingLeft: 90px\` to \`paddingRight: 140px\`.
  7. Rule 6 (Smooth Zooms): Apply a continuous, gentle \`interpolate\` scale zoom across the scene with zero sudden jumps.`;

const response = await ai.models.generateContent({
  model: "gemini-2.5-flash",
  contents: userPrompt,
});

let generatedCode = response.text || "";
// Clean markdown codeblocks if Gemini includes them
generatedCode = generatedCode.replace(/^```[a-zA-Z]*\n/, "").replace(/\n```$/, "").trim();

if (!generatedCode.includes("ShortComposition")) {
  throw new Error("Gemini did not return valid ShortComposition code.");
}

fs.writeFileSync("src/Composition.tsx", generatedCode);
console.log("Successfully generated custom src/Composition.tsx via Gemini!");
