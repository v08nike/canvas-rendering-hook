import { useCallback, useEffect, useRef, useState } from "react";
import { SceneDataType } from "../types/SceneDataType";
import useTimer from "./useTimer";

interface useRenderSceneProps {
  scenesData: SceneDataType[];
  videoLength: number;
}

const useRenderScene = ({ scenesData, videoLength }: useRenderSceneProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentSceneIndex, setCurrentSceneIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [nextStep, setNextStep] = useState<number>(scenesData[0].duration);
  const animationFrameRef = useRef<number | null>(null);
  const currentTextRef = useRef<string>("");
  const updateTextInterval = useRef<NodeJS.Timer | null>(null);

  const canvas = canvasRef.current;
  const video = videoRef.current;
  const context = canvasRef.current?.getContext("2d");

  const { time, onPauseOrResume } = useTimer(videoLength * 1000);

  const drawVideoWithText = useCallback(
    (sceneData: SceneDataType) => {
      if (context && video && canvas) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        context.fillStyle = "white";
        context.font = "20px Arial";
        context.fillText(currentTextRef.current, 20, canvas.height - 30);
      }
    },
    [canvas, context, video]
  );

  const drawImageWithText = useCallback(
    (sceneData: SceneDataType) => {
      if (context && video && canvas) {
        const image = document.createElement("img");
        image.src = sceneData.media;
        image.onload = () => {
          context.drawImage(image, 0, 0, canvas.width, canvas.height);
          context.fillStyle = "white";
          context.font = "20px Arial";
          context.fillText(currentTextRef.current, 20, canvas.height - 30);
        };
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        context.fillStyle = "white";
        context.font = "20px Arial";
        context.fillText(currentTextRef.current, 20, canvas.height - 30);
      }
    },
    [canvas, context, video]
  );

  const updateText = useCallback(() => {
    const media = scenesData[currentSceneIndex];
    if (isPlaying) {
      if (media && video) {
        if (media.type === "image") {
          drawImageWithText(media);
          animationFrameRef.current = requestAnimationFrame(updateText);
        } else if (media.type === "video") {
          drawVideoWithText(media);
          animationFrameRef.current = requestAnimationFrame(updateText);
        }
      }
    }
  }, [
    currentSceneIndex,
    drawImageWithText,
    drawVideoWithText,
    isPlaying,
    scenesData,
    video,
  ]);

  useEffect(() => {
    if (isPlaying) {
      if (updateTextInterval.current) {
        clearInterval(updateTextInterval.current);
      }

      updateTextInterval.current = setInterval(() => {
        currentTextRef.current = scenesData[
          currentSceneIndex
        ].sentence.substring(0, currentTextRef.current.length + 1);
      }, scenesData[currentSceneIndex].typingSpeed || 80);

      updateText();

      if (
        scenesData[currentSceneIndex + 1] &&
        scenesData[currentSceneIndex + 1].type === "video" &&
        video
      ) {
        video.src = scenesData[currentSceneIndex + 1].media;
        video.currentTime = scenesData[currentSceneIndex + 1].startFrom || 0;
      }

      if (scenesData[currentSceneIndex] && video) {
        video.onloadedmetadata = () => {
          video.play();
        };
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSceneIndex, isPlaying]);

  useEffect(() => {
    if (isPlaying) {
      if (updateTextInterval.current) {
        clearInterval(updateTextInterval.current);
      }

      updateTextInterval.current = setInterval(() => {
        currentTextRef.current = scenesData[
          currentSceneIndex
        ].sentence.substring(0, currentTextRef.current.length + 1);
      }, scenesData[currentSceneIndex].typingSpeed || 80);

      if (scenesData[currentSceneIndex].type === "video" && video) {
        video.play();
      }
    } else {
      video?.pause();
      if (updateTextInterval.current) {
        clearInterval(updateTextInterval.current);
      }
    }
  }, [currentSceneIndex, isPlaying, scenesData, video]);

  useEffect(() => {
    if (time === nextStep * 10) {
      setCurrentSceneIndex((prev) => {
        animationFrameRef.current &&
          cancelAnimationFrame(animationFrameRef.current);
        currentTextRef.current = "";

        if (!scenesData[prev + 1]) {
          setIsPlaying(false);
          setNextStep(scenesData[0].duration);
          return 0;
        }
        setNextStep(nextStep + scenesData[prev + 1].duration);
        return prev + 1;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [time, nextStep]);

  const handlePauseOrResume = () => {
    updateTextInterval.current && clearInterval(updateTextInterval.current);
    setIsPlaying(!isPlaying);
    onPauseOrResume();
  };

  return {
    canvasRef,
    videoRef,
    time,
    handlePauseOrResume,
  };
};

export default useRenderScene;
