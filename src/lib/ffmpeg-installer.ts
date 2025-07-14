import path from "path";

let ffmpegPath: string;

if (process.env.NODE_ENV === "production") {
  ffmpegPath = path.join(process.cwd(), "bin", "ffmpeg");
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

export { ffmpegPath };
