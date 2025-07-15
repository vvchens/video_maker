import path from "path";
import os from "os";

let ffmpegPath: string;

const platform = os.platform();

if (platform === "win32") {
  ffmpegPath = path.join(process.cwd(), "ffmpeg", "win", "x64", "ffmpeg.exe");
} else {
  ffmpegPath = path.join(process.cwd(), "ffmpeg", "linux", "arm64", "ffmpeg");
}
console.log(`Using ffmpeg path: ${ffmpegPath}`);
export { ffmpegPath };
