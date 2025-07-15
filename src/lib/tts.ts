import { EdgeTTS, SynthesisResult } from '@duyquangnvx/edge-tts';

const tts = new EdgeTTS();

/**
 * 合成语音并保存为文件
 * @param text 要合成的文本
 * @param voice 语音名称（如 'en-US-AriaNeural'）
 * @param outputFile 输出文件名（不带扩展名，自动为 mp3）
 * @param options 可选参数：rate, volume, pitch
 * @returns SynthesisResult
 */
export async function synthesizeToFile(text: string, {
  voice = 'en-US-AriaNeural',
  outputFile = 'output_audio',
  rate = 0,
  volume = 0,
  pitch = 0,
}: {
  voice?: string;
  outputFile?: string;
  rate?: number;
  volume?: number;
  pitch?: number;
}): Promise<SynthesisResult> {
  const result: SynthesisResult = await tts.synthesize(text, voice, {
    rate,
    volume,
    pitch,
  });
  await result.toFile(outputFile);
  return result;
}

/**
 * 获取可用语音列表
 */
export async function getVoices() {
  return await tts.getVoices();
}