import React, {useContext, useMemo, useRef} from 'react';
import {Internals} from 'remotion';

export type MotionBlurVideoCanvases = NonNullable<
	React.ContextType<typeof Internals.MotionBlurContext>
>['videoCanvases'];

export const useMotionBlurVideoCanvases = () => {
	const parent = useContext(Internals.MotionBlurContext);
	const videoCanvases = useRef<MotionBlurVideoCanvases>(new Map());
	return parent?.videoCanvases ?? videoCanvases.current;
};

export const MotionBlurSampleProvider: React.FC<{
	readonly children: React.ReactNode;
	readonly sampleIndex: number;
	readonly videoCanvases: MotionBlurVideoCanvases;
}> = ({children, sampleIndex, videoCanvases}) => {
	const parent = useContext(Internals.MotionBlurContext);
	const parentIndex = parent?.sampleIndex ?? '';
	const parentIsPrimary = parent?.isPrimarySample ?? true;
	const value = useMemo(
		() => ({
			sampleIndex: `${parentIndex}/${sampleIndex}`,
			isPrimarySample: parentIsPrimary && sampleIndex === 0,
			videoCanvases,
		}),
		[parentIndex, parentIsPrimary, sampleIndex, videoCanvases],
	);

	return (
		<Internals.MotionBlurContext.Provider value={value}>
			{children}
		</Internals.MotionBlurContext.Provider>
	);
};
