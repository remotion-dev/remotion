import React, {  useLayoutEffect, useRef } from 'react';
import {extractFrames} from '@remotion/webcodecs'
import type {RemotionOffthreadVideoProps} from './props.js';
import { useUnsafeVideoConfig } from '../use-unsafe-video-config.js';
import { useCurrentFrame } from '../use-current-frame.js';
import { continueRender, delayRender } from '../delay-render.js';
// import { useMediaStartsAt } from '../audio/use-audio-frame.js';

export const CodecVideoForRendering: React.FC<
  RemotionOffthreadVideoProps
> = ({
  // onError,
  // volume: volumeProp,
  // playbackRate,
  src,
  // muted,
  // allowAmplificationDuringRender,
  // transparent = false,
  // toneMapped = true,
  // toneFrequency,
  // name,
  // loopVolumeCurveBehavior,
  delayRenderRetries,
  delayRenderTimeoutInMilliseconds,
  //call when a frame of the video, i.e. img is rendered
  // onVideoFrame,
  // // Remove crossOrigin prop during rendering
  // // https://discord.com/channels/809501355504959528/844143007183667220/1311639632496033813
  // crossOrigin,
  // ...props
}) => {
  // const absoluteFrame = useTimelinePosition();

  // const frame = useCurrentFrame();
  // const volumePropsFrame = useFrameForVolumeProp(
  // 	loopVolumeCurveBehavior ?? 'repeat',
  // );
  const videoConfig = useUnsafeVideoConfig();
  // const sequenceContext = useContext(SequenceContext);
  // const mediaStartsAt = useMediaStartsAt();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // const [frames, setframes] = useState<VideoFrame[]>([]);
  const frame = useCurrentFrame();

   if (!videoConfig) {
    throw new Error('No video config found');
  }
    // const currentTime = useMemo(() => {
    //   return (
    //     getExpectedMediaFrameUncorrected({
    //       frame,
    //       playbackRate: playbackRate || 1,
    //       startFrom: -mediaStartsAt,
    //     }) / videoConfig.fps
    //   );
    // }, [frame, mediaStartsAt, playbackRate, videoConfig.fps]);

  // const {registerRenderAsset, unregisterRenderAsset} =
  // 	useContext(RenderAssetManager);

  if (!src) {
    throw new TypeError('No `src` was passed to <CodecVideo>.');
  }

  //retrive the active frame with useFrame hook
  //get the current time of the renderer
  //whenever current time changes, search through frames to find the most relevant frame
  //draw the frame on the canvas

  //PLAN FOR CONCURRENCY SUPPORT
  // do something so that activeFrame is determined solely based on frame
  // like write frame'th index of frames to the canvas
  
  // useEffect(()=>{
  //   console.log("called for frame " + frame)
  //   if(!canvasRef.current){
  //     console.log("returning because no ref current")
  //     return
  //   };

  //   // if(frames.length === 0){
  //   //   console.log("returning because no frames")
  //   //   return
  //   // }

  //   // let activeFrame = frames[frame];
  //   // let activeFrame=frames.find(frame => (
  //   //   (frame.timestamp / 1000000) >= currentTime
  //   // ));

  //   // if(!activeFrame){
  //   //   console.log(`returning, you tried fetching index ${frame} of frames which is not available yet  `);
  //   //   console.log(`frames available: ${frames.length}`)
  //   //   return;
  //   // }
  
  //   //get the  col index

  //   //approach:
  //   //1. delayrender
  //   //2. extract individual frame
  //   //3. continue
  //   const newH
  //   console.log("WRITING FRAME AT INDEX " , frame);

  //   canvasRef.current.getContext("2d")?.drawImage(activeFrame,0,0)
  // }, [frame, canvasRef])

 


  useLayoutEffect(()=>{
    if(!canvasRef.current){
      return;
    }
    //  1 : 30
    // x : frame
    console.log("called for frame "+ frame)
    const newHandle = delayRender(`extracting frame number ${frame}`, {
      retries: delayRenderRetries ?? undefined,
      timeoutInMilliseconds: delayRenderTimeoutInMilliseconds ?? undefined,
    });

    extractFrames({
      src,
      timestampsInSeconds: async () =>  {
        console.log(`called for frame ${frame} with timestamp ${frame/videoConfig.fps}`)
        return [frame/videoConfig.fps]
      },
      onFrame:  (extractedFrame) => {
        console.log("successfully extracted the frame " + frame);
        //render the canvas
        canvasRef.current?.getContext("2d")?.drawImage(extractedFrame,0, 0);
        extractedFrame.close()
        //continue render  
        continueRender(newHandle)
      },
    })

    
  },[frame])

  return (
    <canvas width={videoConfig.width} height={videoConfig.height} ref={canvasRef} />
  );
};
