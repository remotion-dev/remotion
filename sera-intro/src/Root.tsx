import { Composition } from 'remotion';
import { SeraIntro } from './SeraIntro';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="SeraIntro"
        component={SeraIntro}
        durationInFrames={180}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
