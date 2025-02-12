export declare const validateSingleFrame: (frame: unknown, variableName: string) => number | null;
export declare const validateInOutFrames: ({ inFrame, durationInFrames, outFrame, }: {
    inFrame: unknown;
    outFrame: unknown;
    durationInFrames: number;
}) => void;
