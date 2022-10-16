import {useState} from 'react'
import type { CSSProperties} from 'react';
import {useMemo, Suspense} from 'react'
import type {TComposition, TimelineContextValue} from "remotion";
import {random, Internals} from "remotion";

export const Thumbnail:React.FC<{
    composition: TComposition<unknown>;
    targetHeight: number;
    targetWidth: number;
    frameToDisplay: number;
    style?: CSSProperties
}> = ({
    composition,
    targetWidth,
    targetHeight,
    frameToDisplay,
    style,
                             }) => {
    const [thumbnailId] = useState(() => String(random(null)));

    const container: CSSProperties = useMemo(() => {
        return {
            width: targetWidth,
            height: targetHeight,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            ...style,
        };
    }, [targetHeight, targetWidth, style]);

    const timelineState: TimelineContextValue = useMemo(() => {
        return {
            playing: false,
            frame: frameToDisplay,
            rootId: thumbnailId,
            imperativePlaying: {
                current: false,
            },
            playbackRate: 1,
            setPlaybackRate: () => {
                throw new Error('thumbnail');
            },
            audioAndVideoTags: {current: []},
        };
    }, [frameToDisplay, thumbnailId]);

    const props = useMemo(() => {
        return (composition.defaultProps as unknown as {}) ?? {};
    }, [composition.defaultProps]);

    const ThumbnailComponent = composition.component;
    
    return <div style={container}>
        <Suspense fallback={null}>
            <Internals.Timeline.TimelineContext.Provider value={timelineState}>
                <ThumbnailComponent {...props} />
            </Internals.Timeline.TimelineContext.Provider>
        </Suspense>
    </div>
}