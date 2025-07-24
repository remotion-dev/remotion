import React, {  useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {extractFrames} from '@remotion/webcodecs'
import {Internals, useCurrentFrame, delayRender, continueRender, RemotionOffthreadVideoProps, random } from 'remotion';
const {useUnsafeVideoConfig, SequenceContext, useFrameForVolumeProp, useTimelinePosition, getAbsoluteSrc, RenderAssetManager, evaluateVolume} = Internals

export const NewVideoForRendering: React.FC<
  RemotionOffthreadVideoProps
> = ({
  // onError,
  volume: volumeProp,
  playbackRate,
  src,
  muted,
  // allowAmplificationDuringRender,
  // transparent = false,
  // toneMapped = true,
  toneFrequency,
  // name,
  loopVolumeCurveBehavior,
  delayRenderRetries,
  delayRenderTimeoutInMilliseconds,
  //call when a frame of the video, i.e. img is rendered
  onVideoFrame,
  // Remove crossOrigin prop during rendering
  // https://discord.com/channels/809501355504959528/844143007183667220/1311639632496033813
  // crossOrigin
  // ...props
}) => {

  const absoluteFrame = useTimelinePosition();
  const videoConfig = useUnsafeVideoConfig();
  const sequenceContext = useContext(SequenceContext);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const {registerRenderAsset, unregisterRenderAsset} = useContext(RenderAssetManager);
  const [activeHandler,setActiveHandler] = useState<any>(null)
  const frame = useCurrentFrame();
  const volumePropsFrame = useFrameForVolumeProp(
      loopVolumeCurveBehavior ?? 'repeat',
    );

    const id = useMemo(
      () =>
        `offthreadvideo-${random(
          src ?? '',
        )}-${sequenceContext?.cumulatedFrom}-${sequenceContext?.relativeFrom}-${sequenceContext?.durationInFrames}`,
      [
        src,
        sequenceContext?.cumulatedFrom,
        sequenceContext?.relativeFrom,
        sequenceContext?.durationInFrames,
      ],
    );

   if (!videoConfig) {
    throw new Error('No video config found');
  }


  if (!src) {
    throw new TypeError('No `src` was passed to <NewVideo>.');
  }

 
    const volume = evaluateVolume({
      volume: volumeProp,
      frame: volumePropsFrame,
      mediaVolume: 1,
    });
  
    useEffect(() => {
      if (!src) {
        throw new Error('No src passed');
      }
  
      if (!window.remotion_audioEnabled) {
        return;
      }
  
      if (muted) {
        return;
      }
  
      if (volume <= 0) {
        return;
      }
  
      registerRenderAsset({
        type: 'video',
        src: getAbsoluteSrc(src),
        id,
        frame: absoluteFrame,
        volume,
        mediaFrame: frame,
        playbackRate: playbackRate ?? 1,
        toneFrequency: toneFrequency ?? null,
        audioStartFrame: Math.max(0, -(sequenceContext?.relativeFrom ?? 0)),
      });
  
      return () => unregisterRenderAsset(id);
    }, [
      muted,
      src,
      registerRenderAsset,
      id,
      unregisterRenderAsset,
      volume,
      frame,
      absoluteFrame,
      playbackRate,
      toneFrequency,
      sequenceContext?.relativeFrom,
    ]);


  useLayoutEffect(()=>{
    if(!canvasRef.current){
      return;
    }
    
    const newHandle = delayRender(`extracting frame number ${frame}`, {
      retries: delayRenderRetries ?? undefined,
      timeoutInMilliseconds: delayRenderTimeoutInMilliseconds ?? undefined,
    });

    extractFrames({
      src,
      timestampsInSeconds: async ({ container }) => {
      let fps = videoConfig.fps;
      let actualFPS = playbackRate ? fps / playbackRate : fps
      let timestamp;
      if (container === "mp4") {
        timestamp = Math.round(((frame + 1) / actualFPS) * 1000 + 1) / 1000;
      } else {
        timestamp = Math.round((frame / actualFPS) * 1000) / 1000;
      }
      return [timestamp];
      },
      onFrame: (extractedFrame) => {
      canvasRef.current?.getContext("2d")?.drawImage(extractedFrame, 0, 0);
      onVideoFrame?.(extractedFrame);
      extractedFrame.close();
      setActiveHandler(newHandle);
      },
    });

    
  },[frame, playbackRate])


useEffect(() => {
  if (activeHandler !== null) {
    requestAnimationFrame(() => {
      continueRender(activeHandler);
    });
  }
}, [activeHandler]);

  return (
    <canvas width={videoConfig.width} height={videoConfig.height} ref={canvasRef} />
  );
};
