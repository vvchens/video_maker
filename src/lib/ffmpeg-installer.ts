import path from "path";
import os from "os";

let ffmpegPath: string;

const platform = os.platform();

if (platform === "win32") {
  ffmpegPath = path.join(process.cwd(), "bin", "ffmpeg.exe");
} else {
  ffmpegPath = path.join(process.cwd(), "bin", "ffmpeg");
}

export { ffmpegPath };
