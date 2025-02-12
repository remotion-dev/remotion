import type { FC, PropsWithChildren } from 'react';
import React from 'react';
import type { LayoutAndStyle, SequenceProps } from '../Sequence.js';
import { ENABLE_V5_BREAKING_CHANGES } from '../v5-flag.js';
type SeriesSequenceProps = PropsWithChildren<{
    readonly durationInFrames: number;
    readonly offset?: number;
    readonly className?: string;
} & Pick<SequenceProps, 'layout' | 'name'> & LayoutAndStyle>;
declare const SeriesSequence: React.ForwardRefExoticComponent<SeriesSequenceProps & React.RefAttributes<HTMLDivElement>>;
type V4Props = {
    children: React.ReactNode;
};
type V5Props = SequenceProps;
type SeriesProps = true extends typeof ENABLE_V5_BREAKING_CHANGES ? V5Props : V4Props;
/**
 * @description with this component, you can easily stitch together scenes that should play sequentially after another.
 * @see [Documentation](https://www.remotion.dev/docs/series)
 */
declare const Series: FC<SeriesProps> & {
    Sequence: typeof SeriesSequence;
};
export { Series };
