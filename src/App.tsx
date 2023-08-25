import React from "react";
import userRenderScene from "./hooks/useRenderScene";
import { scenesData } from "./utils/mediaData";

const App: React.FC = () => {
  const { canvasRef, videoRef, audioRef, time, handlePauseOrResume } =
    userRenderScene({
      scenesData,
      videoLength: 16,
    });

  return (
    <div className="flex flex-col items-center justify-center">
      <h1 className="text-5xl">Pantheon Question One</h1>
      <div className="mt-4 rounded-md bg-gray-100">
        <canvas
          ref={canvasRef}
          width={800}
          height={450}
          onClick={() => {
            handlePauseOrResume();
          }}
        />
        <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700">
          <div
            className="bg-blue-600 h-1.5 rounded-full dark:bg-blue-500"
            style={{ width: `${time / 1.6}%` }}
          ></div>
        </div>
      </div>
      <video ref={videoRef} style={{ display: "none" }}>
        <source src={scenesData[1].media} />
      </video>
      <audio
        ref={audioRef}
        style={{ display: "none" }}
        controls
        autoPlay={false}
      >
        <source src={scenesData[0].audio} type="audio/mp3" />
      </audio>
    </div>
  );
};

export default App;
