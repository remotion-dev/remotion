import React from 'react';
import {VideoautoplayDemo} from "./VideoAutoplay";
import {Thumbnail} from "@remotion/player";

export const ThumbnailDemo: React.FC = () => {

    return <div style={{margin: '2rem'}}>
        <Thumbnail component={VideoautoplayDemo} compositionWidth={500}
                   compositionHeight={432} frameToDisplay={1} durationInFrames={2700} fps={30}/>
    </div>
}