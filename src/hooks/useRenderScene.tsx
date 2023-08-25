import { useCallback, useEffect, useRef, useState } from "react";
import { SceneDataType } from "../types/SceneDataType";
import useTimer from "./useTimer";

interface useRenderSceneProps {
  scenesData: SceneDataType[];
  videoLength: number;
}

const IMAGE_TRANSITION_SPEED = 10;
const IMAGE_TRANSITION_INTERVAL = 20;
const DEFAULT_TYPING_SPEED = 65;

const useRenderScene = ({ scenesData, videoLength }: useRenderSceneProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentSceneIndex, setCurrentSceneIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [nextStep, setNextStep] = useState<number>(scenesData[0].duration);
  const imageTransition = useRef<boolean>(false);
  const imageX = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);
  const currentTextRef = useRef<string>("");
  const updateTextInterval = useRef<NodeJS.Timer | null>(null);
  const transitionInterval = useRef<NodeJS.Timer | null>(null);

  const { time, onPauseOrResume } = useTimer(videoLength * 1000);

  const clearUpdateTextInterval = useCallback(() => {
    if (updateTextInterval.current) {
      clearInterval(updateTextInterval.current);
      updateTextInterval.current = null;
    }
  }, []);

  const clearTransitionInterval = useCallback(() => {
    if (transitionInterval.current) {
      clearInterval(transitionInterval.current);
      transitionInterval.current = null;
    }
  }, []);

  const drawMediaWithText = useCallback(
    (
      prevMedia: SceneDataType,
      sceneData: SceneDataType,
      drawImage: boolean
    ) => {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas?.getContext("2d");

      if (!context || !video || !canvas) return;

      const drawImageOnCanvas = (
        src: string,
        x: number,
        y: number,
        width: number,
        height: number
      ) => {
        const image = new Image();
        image.src = src;
        image.onload = () => context.drawImage(image, x, y, width, height);
      };

      if (drawImage) {
        drawImageOnCanvas(sceneData.media, 0, 0, canvas.width, canvas.height);
      } else {
        context.drawImage(
          video,
          imageTransition.current ? canvas.width + imageX.current : 0,
          0,
          canvas.width,
          canvas.height
        );

        if (imageTransition.current) {
          drawImageOnCanvas(
            prevMedia.media,
            imageX.current,
            0,
            canvas.width,
            canvas.height
          );

          if (Math.abs(imageX.current) > canvas.width) {
            transitionInterval.current &&
              clearInterval(transitionInterval.current);
            imageX.current = 0;
            imageTransition.current = false;
          }
        }
      }

      context.fillStyle = "white";
      context.font = "20px Arial";
      context.fillText(currentTextRef.current, 20, canvas.height - 30);
    },
    []
  );

  const updateText = useCallback(() => {
    const media = scenesData[currentSceneIndex];
    if (isPlaying && media && videoRef.current) {
      drawMediaWithText(
        scenesData[currentSceneIndex - 1],
        media,
        media.type === "image"
      );
      animationFrameRef.current = requestAnimationFrame(updateText);
    }
  }, [currentSceneIndex, drawMediaWithText, isPlaying, scenesData]);

  const updateTextWithTypingSpeed = useCallback(() => {
    if (imageTransition.current) return;

    const audio = audioRef.current;
    if (
      audio &&
      audio.paused &&
      currentTextRef.current.length <
        scenesData[currentSceneIndex].sentence.length
    ) {
      audio.play();
    }

    currentTextRef.current = scenesData[currentSceneIndex].sentence.substring(
      0,
      currentTextRef.current.length + 1
    );
  }, [currentSceneIndex, scenesData]);

  useEffect(() => {
    if (
      scenesData[currentSceneIndex + 1] &&
      scenesData[currentSceneIndex + 1].type === "video"
    ) {
      const video = videoRef.current;
      if (video) {
        video.src = scenesData[currentSceneIndex + 1].media;
        video.currentTime = scenesData[currentSceneIndex + 1].startFrom || 0;
      }
    }

    const audio = audioRef.current;
    if (audio) {
      audio.src = scenesData[currentSceneIndex].audio || "";
    }

    if (scenesData[currentSceneIndex].type === "video") {
      imageTransition.current = true;
      transitionInterval.current = setInterval(() => {
        imageX.current -= IMAGE_TRANSITION_SPEED;
      }, IMAGE_TRANSITION_INTERVAL);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSceneIndex]);

  useEffect(() => {
    if (isPlaying) {
      const media = scenesData[currentSceneIndex];

      clearUpdateTextInterval();
      updateTextInterval.current = setInterval(
        updateTextWithTypingSpeed,
        media.typingSpeed || DEFAULT_TYPING_SPEED
      );

      if (media.type === "video") {
        if (imageX.current < 0 && imageTransition.current) {
          transitionInterval.current = setInterval(() => {
            imageX.current -= 10;
          }, 20);
        }
        videoRef.current?.play();
      }

      if (animationFrameRef.current)
        cancelAnimationFrame(animationFrameRef.current);
      updateText();
    } else {
      clearUpdateTextInterval();
      clearTransitionInterval();
      videoRef.current?.pause();
      audioRef.current?.pause();
    }
  }, [
    clearTransitionInterval,
    clearUpdateTextInterval,
    currentSceneIndex,
    isPlaying,
    scenesData,
    updateText,
    updateTextWithTypingSpeed,
  ]);

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
  }, [time, nextStep, scenesData]);

  const handlePauseOrResume = () => {
    updateTextInterval.current && clearInterval(updateTextInterval.current);
    setIsPlaying(!isPlaying);
    onPauseOrResume();
  };

  return {
    canvasRef,
    videoRef,
    audioRef,
    time,
    handlePauseOrResume,
  };
};

export default useRenderScene;
