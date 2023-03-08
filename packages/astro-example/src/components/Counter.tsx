import "./Counter.css";
import { Player } from "@remotion/player";
import { Gif } from "@remotion/gif";
import { Pumpkin } from "./LottieExample";

const Comp: React.FC = () => {
  return (
    <div>
      <Gif
        src="https://media.giphy.com/media/xT0GqH01ZyKwd3aT3G/giphy.gif"
        fit="cover"
        height={200}
        width={200}
      />
      <Pumpkin></Pumpkin>
    </div>
  );
};

export default function Counter() {
  return (
    <>
      <Player
        component={Comp}
        durationInFrames={100}
        compositionWidth={1000}
        compositionHeight={1000}
        fps={30}
        controls
      ></Player>
    </>
  );
}
