import { SceneDataType } from "./../types/SceneDataType";

export const scenesData: SceneDataType[] = [
  {
    index: 0,
    type: "image",
    sentence: "This is a simple Javascript test",
    media: "https://miro.medium.com/max/1024/1*OK8xc3Ic6EGYg2k6BeGabg.jpeg",
    audio: "/assets/audio/this_is_a_simple_Javascript_test.mp3",
    duration: 3,
  },
  {
    index: 1,
    type: "video",
    sentence: "Here comes the video!",
    media:
      "https://media.gettyimages.com/videos/goodlooking-young-woman-in%02casual-clothing-is-painting-in-workroom-video-id1069900546",
    audio: "/assets/audio/here_comes_the_video!.mp3",
    startFrom: 5,
    duration: 5,
  },
  {
    index: 2,
    type: "image",
    sentence: "This is a second repeated screen",
    media: "https://miro.medium.com/max/1024/1*OK8xc3Ic6EGYg2k6BeGabg.jpeg",
    audio: "/assets/audio/this_is_a_second_repeated_screen.mp3",
    duration: 3,
  },
  {
    index: 3,
    type: "video",
    sentence: "This is our last video!",
    media:
      "https://media.gettyimages.com/videos/goodlooking-young-woman-in%02casual-clothing-is-painting-in-workroom-video-id1069900546",
    audio: "/assets/audio/this_is_our_last_video.mp3",
    startFrom: 8,
    duration: 5,
  },
];
