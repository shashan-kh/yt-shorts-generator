import fs from "fs";

// Support both GitHub issue comments and fallback text for manual runs
const rawComment = process.env.COMMENT_BODY || "";
const scriptText = rawComment.replace("/create-short", "").trim() || 
  "Stop trying to hit 10,000 steps. Doctors say it's not the number that matters. Large studies found the health benefits start climbing well before 10,000, and they begin to level off around 7,000 steps a day. That's roughly 30 to 40 minutes of walking. But here's the trick almost nobody uses: walk for just 10 minutes after your biggest meal. It helps your body handle the sugar spike from that meal, which is better for your energy and your heart. So your plan is simple. Seven thousand steps a day. Ten minutes after dinner. That's it. No gym, no app, no money. Save this, and tonight after dinner, go for a walk.";

console.log(`Processing script length: ${scriptText.length} characters`);

// Split script into readable chunks/sentences
const sentences = scriptText.match(/[^.!?]+[.!?]+|\s*[^.!?]+$/g) || [scriptText];
let currentTime = 0;
const fps = 30;
const lines = [];

sentences.forEach((sentence) => {
  const text = sentence.trim();
  if (!text) return;
  
  // Estimate duration based on word count (approx 3 words per second for fast short-form pacing)
  const wordCount = text.split(/\s+/).length;
  const durationInSeconds = Math.max(3, wordCount * 0.4); 
  
  const startFrame = Math.round(currentTime * fps);
  const endFrame = Math.round((currentTime + durationInSeconds) * fps);

  lines.push({
    start: startFrame,
    end: endFrame,
    text: text
  });

  currentTime += durationInSeconds;
});

// Total video duration in frames (+ 2 seconds buffer at the end)
const totalDurationFrames = Math.round((currentTime + 2) * fps);

const outputData = {
  script: scriptText,
  durationInFrames: totalDurationFrames,
  lines: lines
};

fs.writeFileSync("src/script.json", JSON.stringify(outputData, null, 2));
console.log(`Successfully generated src/script.json. Total frames: ${totalDurationFrames}`);
