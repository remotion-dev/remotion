import { Player } from "@remotion/player";
import React from "react";
import {JSONAsDataset, AfterCreditItem} from "./JSONAsDataset"


export const JsonAsDSAllItems: React.FC = () => {
  return (
   <div>
       <Player
      component={JSONAsDataset}
      compositionWidth={1920}
      compositionHeight={1080}
      fps={30}
      durationInFrames={150}
      controls
      loop
      style={{
        width: "100%",
      }}
    />
   </div>
  );
};

export const JsonAsDSItem: React.FC = () => {
  return (
    <div>
        <Player
       component={AfterCreditItem}
       compositionWidth={1920}
       compositionHeight={1080}
       fps={30}
       durationInFrames={150}
       controls
       loop
       style={{
         width: "100%",
       }}
       inputProps={{
        "name": "remotion examples",
        "source_type": "github",
        "metadata": {
          "project_url": "   https://github.com/remotion-dev/logo"
        },
        "isSingle": true
      }}
     />
    </div>
   );

};

export const RenderVideo: React.FC = () => {
  return (
      <div> 
        <video
      src={"/img/json-as-dataset/cli.mov"}
      autoPlay
      muted
      playsInline
      loop
    />

      </div>
  )
}