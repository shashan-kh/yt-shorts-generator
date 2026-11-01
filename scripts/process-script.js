import fs from "fs";

const commentBody = process.env.COMMENT_BODY || "";
// Extract script text following the /create-short command
const scriptText = commentBody.replace("/create-short", "").trim();

console.log(`Extracted script from GitHub comment: "${scriptText}"`);

// Automatically segment script sentences into timed segments (3-5 seconds per block)
const words = scriptText.split(" ");
const chunks = [];
let currentChunk = [];
let startTime = 0;
const chunkDuration = 4; // seconds per block

words.forEach((word, index) => {
  currentChunk.push(word);
  if (currentChunk.length >= 6 || index === words.length - 1) {
    const text = currentChunk.join(" ");
    chunks.push({
      start: startTime,
      end: startTime + chunkDuration,
      text: text
    });
    startTime += chunkDuration;
    currentChunk = [];
  }
});

const outputData = {
  script: scriptText,
  lines: chunks.length > 0 ? chunks : [{ start: 0, end: 5, text: scriptText }]
};

fs.writeFileSync("src/script.json", JSON.stringify(outputData, null, 2));
console.log("Successfully generated src/script.json from the GitHub comment script.");
