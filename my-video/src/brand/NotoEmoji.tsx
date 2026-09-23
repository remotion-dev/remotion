import {Lottie, type LottieAnimationData} from "@remotion/lottie";
import {useEffect, useState} from "react";
import {staticFile, useDelayRender} from "remotion";

// A Noto animated emoji from public/emoji/<name>.json, drawn as vector Lottie
// so it stays sharp at any size. Save more with
// `node scripts/fetch-noto-emoji.mjs <name>…` (see "Emoji" in AGENTS.md).
// CC BY 4.0: a video that uses them credits "Noto Emoji Animation by Google,
// CC BY 4.0" in its description.
export const NotoEmoji: React.FC<{name: string; size: number; loop: boolean}> = ({name, size, loop}) => {
  const {delayRender, continueRender, cancelRender} = useDelayRender();
  const [handle] = useState(() => delayRender(`Loading emoji ${name}`));
  const [animationData, setAnimationData] = useState<LottieAnimationData | null>(null);

  useEffect(() => {
    fetch(staticFile(`emoji/${name}.json`))
      .then((response) => response.json())
      .then((json) => {
        setAnimationData(json);
        continueRender(handle);
      })
      .catch((err) => {
        cancelRender(err);
      });
  }, [name, handle, continueRender, cancelRender]);

  return animationData ? <Lottie animationData={animationData} loop={loop} style={{width: size, height: size}} /> : null;
};
