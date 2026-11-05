// Turn a voiceover into word-by-word captions for Remotion.
// Usage:  npm run captions -- public/audio/voiceover.mp3
// Output: public/captions/<file-name>.json
// First run downloads Whisper (speech-to-text) + a model, so it takes a while.
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import {
  downloadWhisperModel,
  installWhisperCpp,
  toCaptions,
  transcribe,
} from "@remotion/install-whisper-cpp";

const input = process.argv[2];
if (!input) {
  console.error("Usage: npm run captions -- public/audio/voiceover.mp3");
  process.exit(1);
}

const MODEL = "medium.en"; // use "small.en" for faster, slightly less accurate
const WHISPER_VERSION = "1.5.5";
const whisperPath = path.join(process.cwd(), "whisper.cpp");

await installWhisperCpp({ to: whisperPath, version: WHISPER_VERSION });
await downloadWhisperModel({ model: MODEL, folder: whisperPath });

const name = path.basename(input, path.extname(input));
const wav = path.join(whisperPath, `${name}.wav`);
execSync(`ffmpeg -y -i "${input}" -ar 16000 -ac 1 "${wav}"`, { stdio: "inherit" });

const whisperCppOutput = await transcribe({
  model: MODEL,
  whisperPath,
  whisperCppVersion: WHISPER_VERSION,
  inputPath: wav,
  tokenLevelTimestamps: true,
});
const { captions } = toCaptions({ whisperCppOutput });

fs.mkdirSync("public/captions", { recursive: true });
const out = path.join("public/captions", `${name}.json`);
fs.writeFileSync(out, JSON.stringify(captions, null, 2));
console.log(`Captions saved to ${out}`);
