import React, {useContext, useMemo, useRef} from 'react';
import {Internals} from 'remotion';

export type MotionBlurCanvases = NonNullable<
	React.ContextType<typeof Internals.MotionBlurContext>
>['canvases'];

export const useMotionBlurCanvases = () => {
	const parent = useContext(Internals.MotionBlurContext);
	const canvases = useRef<MotionBlurCanvases>(new Map());
	return parent?.canvases ?? canvases.current;
};

export const MotionBlurSampleProvider: React.FC<{
	readonly children: React.ReactNode;
	readonly sampleIndex: number;
	readonly canvases: MotionBlurCanvases;
}> = ({children, sampleIndex, canvases}) => {
	const parent = useContext(Internals.MotionBlurContext);
	const parentIndex = parent?.sampleIndex ?? '';
	const parentIsPrimary = parent?.isPrimarySample ?? true;
	const value = useMemo(
		() => ({
			sampleIndex: `${parentIndex}/${sampleIndex}`,
			isPrimarySample: parentIsPrimary && sampleIndex === 0,
			canvases,
		}),
		[parentIndex, parentIsPrimary, sampleIndex, canvases],
	);

	return (
		<Internals.DisableSequenceRegistrationProvider
			disabled={!value.isPrimarySample}
		>
			<Internals.MotionBlurContext.Provider value={value}>
				{children}
			</Internals.MotionBlurContext.Provider>
		</Internals.DisableSequenceRegistrationProvider>
	);
};
