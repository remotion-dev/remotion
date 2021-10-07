import { useCurrentFrame } from './use-frame';
import { useVideo } from './use-video';

export const useCurrentTime = (): number => {
  const video = useVideo();
  const currentFrame = useCurrentFrame();

    if (video?.fps && currentFrame) {
      return 1000 * (currentFrame / video.fps);
    }

    return 0;
};
