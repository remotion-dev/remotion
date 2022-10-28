import type {ComponentType, CSSProperties, LazyExoticComponent} from 'react';
import {Suspense, useMemo, useState} from 'react';
import type {
    CompositionManagerContext,
    CompProps,
    TimelineContextValue,
} from 'remotion';
import {Internals, random} from 'remotion';
import type {PropsIfHasProps} from './utils/props-if-has-props';

type ThumbnailProps<T> = PropsIfHasProps<T> &
    CompProps<T> & {
    frameToDisplay: number;
    style?: CSSProperties;
    durationInFrames: number;
    compositionWidth: number;
    compositionHeight: number;
    inputProps?: unknown;
    fps: number;
};

export const Thumbnail = <T, >({
                                   frameToDisplay,
                                   style,
                                   inputProps,
                                   compositionHeight,
                                   compositionWidth,
                                   durationInFrames,
                                   fps,
                                   ...componentProps
                               }: ThumbnailProps<T>) => {
    const [thumbnailId] = useState(() => String(random(null)));

    const container: CSSProperties = useMemo(() => {
        return {
            width: compositionWidth,
            height: compositionHeight,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
            ...style,
        };
    }, [compositionWidth, compositionHeight, style]);

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
        return (inputProps ?? {}) as unknown as {};
    }, [inputProps]);

    const Component = Internals.useLazyComponent(
        componentProps
    ) as LazyExoticComponent<ComponentType<unknown>>;

    const compositionManagerContext: CompositionManagerContext = useMemo(() => {
        return {
            compositions: [
                {
                    component: Component as React.LazyExoticComponent<ComponentType<unknown>>,
                    durationInFrames,
                    height: compositionHeight,
                    width: compositionWidth,
                    fps,
                    id: 'player-comp',
                    props: inputProps as unknown,
                    nonce: 777,
                    scale: 1,
                    folderName: null,
                    defaultProps: undefined,
                    parentFolderName: null,
                },
            ],
            folders: [],
            registerFolder: () => undefined,
            unregisterFolder: () => undefined,
            currentComposition: 'player-comp',
            registerComposition: () => undefined,
            registerSequence: () => undefined,
            sequences: [],
            setCurrentComposition: () => undefined,
            unregisterComposition: () => undefined,
            unregisterSequence: () => undefined,
            registerAsset: () => undefined,
            unregisterAsset: () => undefined,
            currentCompositionMetadata: null,
            setCurrentCompositionMetadata: () => undefined,
            assets: [],
        };
    }, [
        Component,
        durationInFrames,
        compositionHeight,
        compositionWidth,
        fps,
        inputProps,
    ]);

    return (
        <Internals.CanUseRemotionHooksProvider>
            <Internals.Timeline.TimelineContext.Provider value={timelineState}>
                    <Internals.CompositionManager.Provider
                        value={compositionManagerContext}
                    >
                        <Internals.PrefetchProvider>
                            <Internals.DurationsContextProvider>
                                <div style={container}>
                                    <Suspense fallback={null}>
                                        <Component {...props} />
                                    </Suspense>
                                </div>
                            </Internals.DurationsContextProvider>
                        </Internals.PrefetchProvider>
                    </Internals.CompositionManager.Provider>
            </Internals.Timeline.TimelineContext.Provider>
        </Internals.CanUseRemotionHooksProvider>
    );
};
