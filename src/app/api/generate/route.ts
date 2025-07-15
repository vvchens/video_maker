import { NextRequest, NextResponse } from "next/server";
import { synthesizeToFile } from "@/lib/tts";
import { ffmpegPath } from "@/lib/ffmpeg-installer";
import ffmpeg from "fluent-ffmpeg";
import fs from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

ffmpeg.setFfmpegPath(ffmpegPath);

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const scenes = JSON.parse(formData.get("scenes") as string);
  const files = formData.getAll("files") as File[];

  const tempDir = path.join(process.cwd(), "tmp", uuidv4());
  await fs.mkdir(tempDir, { recursive: true });

  try {
    const sceneVideos: string[] = [];

    for (let i = 0; i < scenes.length; i++) {
      const scene = scenes[i];
      const file = files[i];
      const audioPath = path.join(tempDir, `${i}.mp3`);
      await synthesizeToFile(scene.text, { outputFile: audioPath });

      const audioDuration = await getAudioDuration(audioPath);
      const mediaPath = path.join(tempDir, file.name);
      await fs.writeFile(mediaPath, Buffer.from(await file.arrayBuffer()));

      const sceneVideoPath = path.join(tempDir, `scene-${i}.mp4`);

      if (file.type.startsWith("image/")) {
        await createImageScene(
          mediaPath,
          audioPath,
          audioDuration,
          sceneVideoPath,
        );
      } else {
        await createVideoScene(
          mediaPath,
          audioPath,
          audioDuration,
          sceneVideoPath,
        );
      }
      sceneVideos.push(sceneVideoPath);
    }

    const finalVideoPath = path.join(tempDir, "final.mp4");
    await mergeVideos(sceneVideos, finalVideoPath);

    const videoBuffer = await fs.readFile(finalVideoPath);
    const response = new NextResponse(videoBuffer, {
      status: 200,
      headers: {
        "Content-Type": "video/mp4",
        "Content-Disposition": `attachment; filename="generated-video.mp4"`,
      },
    });

    return response;
  } catch (error) {
    console.error(error);
    return new NextResponse(JSON.stringify({ error: "Failed to generate video." }), {
      status: 500,
    });
  } finally {
    // await fs.rm(tempDir, { recursive: true, force: true });
  }
}

function getAudioDuration(audioPath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(audioPath, (err, metadata) => {
      if (err) {
        reject(err);
      } else {
        resolve(metadata.format.duration || 0);
      }
    });
  });
}

function createImageScene(
  imagePath: string,
  audioPath: string,
  duration: number,
  outputPath: string,
): Promise<void> {
  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(imagePath)
      .loop(duration)
      .input(audioPath)
      .videoCodec("libx264")
      .audioCodec("aac")
      .audioFilters("apad")
      .outputOptions("-shortest")
      .on("end", () => resolve())
      .on("error", reject)
      .save(outputPath);
  });
}

function createVideoScene(
  videoPath: string,
  audioPath: string,
  duration: number,
  outputPath: string,
): Promise<void> {
  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(videoPath)
      .input(audioPath)
      .videoCodec("libx264")
      .audioCodec("aac")
      .outputOptions(`-t ${duration}`)
      .on("end", () => resolve())
      .on("error", reject)
      .save(outputPath);
  });
}

function mergeVideos(
  videoPaths: string[],
  outputPath: string,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const command = ffmpeg();
    videoPaths.forEach((videoPath) => {
      command.input(videoPath);
    });
    command
      .on("end", () => resolve())
      .on("error", reject)
      .mergeToFile(outputPath, ".");
  });
}
