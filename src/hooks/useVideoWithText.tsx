import { useRef, useEffect } from "react";

interface VideoWithTextProps {
  videoPath: string;
  text: string;
  typingSpeed: number;
  startFrom: number;
  duration: number;
}

const useVideoWithText = ({
  videoPath,
  text,
  typingSpeed,
  startFrom,
  duration,
}: VideoWithTextProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const currentTextRef = useRef<string>("");
  const updateTextInterval = useRef<NodeJS.Timer | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    if (!canvas || !video) return;

    const context = canvas.getContext("2d");

    if (!context) return;

    const draw = () => {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      context.fillStyle = "white";
      context.font = "20px Arial";
      context.fillText(currentTextRef.current, 20, canvas.height - 30);
    };

    const updateText = () => {
      if (video.currentTime <= startFrom + duration) {
        draw();
      } else {
        video.pause();
        updateTextInterval.current && clearInterval(updateTextInterval.current);
        return;
      }
      animationFrameRef.current = requestAnimationFrame(updateText);
    };

    video.addEventListener("play", () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      currentTextRef.current = "";
      draw();
      animationFrameRef.current = requestAnimationFrame(updateText);
    });

    video.src = videoPath;

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [videoPath, text, typingSpeed, canvasRef, videoRef, startFrom, duration]);

  const onPlay = () => {
    if (currentTextRef.current.length < text.length) {
      updateTextInterval.current = setInterval(() => {
        currentTextRef.current = text.substring(
          0,
          currentTextRef.current.length + 1
        );
      }, typingSpeed);
    }
    const video = videoRef.current;
    if (video) {
      video.currentTime = startFrom;
      video && video.play();
    }
  };

  const onPause = () => {
    const video = videoRef.current;
    updateTextInterval.current && clearInterval(updateTextInterval.current);
    video && video.pause();
  };

  const onPauseAndResume = () => {
    const video = videoRef.current;
    if (video?.paused) {
      onPlay();
    } else {
      updateTextInterval.current && clearInterval(updateTextInterval.current);
      video && video.pause();
    }
  };

  return { canvasRef, videoRef, onPlay, onPause, onPauseAndResume };
};

export default useVideoWithText;
