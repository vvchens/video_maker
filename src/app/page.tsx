"use client";

import { useState } from "react";
import { v4 as uuidv4 } from "uuid";

interface Scene {
  id: string;
  text: string;
  file: File | null;
}

export default function Home() {
  const [scenes, setScenes] = useState<Scene[]>([
    { id: uuidv4(), text: "", file: null },
  ]);
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  const addScene = () => {
    setScenes([...scenes, { id: uuidv4(), text: "", file: null }]);
  };

  const removeScene = (id: string) => {
    setScenes(scenes.filter((scene) => scene.id !== id));
  };

  const handleTextChange = (id: string, text: string) => {
    setScenes(
      scenes.map((scene) => (scene.id === id ? { ...scene, text } : scene)),
    );
  };

  const handleFileChange = (id: string, file: File | null) => {
    setScenes(
      scenes.map((scene) => (scene.id === id ? { ...scene, file } : scene)),
    );
  };

  const generateVideo = async () => {
    setLoading(true);
    setVideoUrl(null);

    const formData = new FormData();
    const sceneData = scenes.map((scene) => ({
      text: scene.text,
    }));
    formData.append("scenes", JSON.stringify(sceneData));
    scenes.forEach((scene) => {
      if (scene.file) {
        formData.append("files", scene.file);
      }
    });

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setVideoUrl(url);
      } else {
        console.error("Failed to generate video");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Simple Video Generator</h1>
      {scenes.map((scene, index) => (
        <div key={scene.id} className="mb-4 p-4 border rounded">
          <h2 className="text-lg font-semibold mb-2">Scene {index + 1}</h2>
          <textarea
            className="w-full p-2 border rounded mb-2"
            placeholder="Enter text for this scene"
            value={scene.text}
            onChange={(e) => handleTextChange(scene.id, e.target.value)}
          />
          <input
            type="file"
            accept="image/*,video/*"
            onChange={(e) =>
              handleFileChange(scene.id, e.target.files ? e.target.files[0] : null)
            }
          />
          <button
            className="ml-2 px-2 py-1 bg-red-500 text-white rounded"
            onClick={() => removeScene(scene.id)}
          >
            Remove
          </button>
        </div>
      ))}
      <button
        className="px-4 py-2 bg-blue-500 text-white rounded"
        onClick={addScene}
      >
        Add Scene
      </button>
      <button
        className="ml-4 px-4 py-2 bg-green-500 text-white rounded"
        onClick={generateVideo}
        disabled={loading}
      >
        {loading ? "Generating..." : "Generate Video"}
      </button>

      {videoUrl && (
        <div className="mt-4">
          <h2 className="text-xl font-bold mb-2">Generated Video</h2>
          <video src={videoUrl} controls className="w-full" />
          <a
            href={videoUrl}
            download="generated-video.mp4"
            className="text-blue-500"
          >
            Download Video
          </a>
        </div>
      )}
    </div>
  );
}
