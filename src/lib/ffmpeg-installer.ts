import path from "path";
import os from "os";

let ffmpegPath: string;

if (process.env.NODE_ENV === "production") {
  const platform = os.platform();
  const arch = os.arch();

  if (platform === "linux" && arch === "arm64") {
    ffmpegPath = path.join(process.cwd(), "bin", "ffmpeg");
  } else {
    // For other production environments, you might need to add more conditions
    // or provide a default ffmpeg path.
    ffmpegPath = "ffmpeg";
  }
} else {
  // For development, we'll use the ffmpeg binary from the bin directory
  // based on the operating system.
  const platform = os.platform();
  if (platform === "win32") {
    ffmpegPath = path.join(process.cwd(), "bin", "ffmpeg.exe");
  } else {
    try {
      ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
    } catch (e) {
      console.warn(
        "ffmpeg-installer not found. Please install it for development.",
      );
      ffmpegPath = "ffmpeg";
    }
  }
}

export { ffmpegPath };
