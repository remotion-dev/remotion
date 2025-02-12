import type { AnyZodObject } from 'zod';
import type { CalculateMetadataFunction } from './Composition.js';
import type { InferProps } from './props-if-has-props.js';
import type { VideoConfig } from './video-config.js';
type ResolveVideoConfigParams = {
    compositionId: string;
    compositionWidth: number | null;
    compositionHeight: number | null;
    compositionFps: number | null;
    compositionDurationInFrames: number | null;
    calculateMetadata: CalculateMetadataFunction<InferProps<AnyZodObject, Record<string, unknown>>> | null;
    signal: AbortSignal;
    defaultProps: Record<string, unknown>;
    originalProps: Record<string, unknown>;
};
export declare const resolveVideoConfig: ({ calculateMetadata, signal, defaultProps, originalProps, compositionId, compositionDurationInFrames, compositionFps, compositionHeight, compositionWidth, }: ResolveVideoConfigParams) => VideoConfig | Promise<VideoConfig>;
export declare const resolveVideoConfigOrCatch: (params: ResolveVideoConfigParams) => {
    type: "success";
    result: VideoConfig | Promise<VideoConfig>;
} | {
    type: "error";
    error: Error;
};
export {};
