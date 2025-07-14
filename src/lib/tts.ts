// This file will contain the text-to-speech service logic.
// We will use edge-tts-node for this.
import { EdgeTTS } from "edge-tts-node";

export async function textToSpeech(text: string, outputFile: string): Promise<void> {
  const tts = new EdgeTTS({
    voice: "en-US-AriaNeural",
    lang: "en-US",
  });
  await tts.save(text, outputFile);
}
