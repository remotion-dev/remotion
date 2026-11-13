import {useLayoutEffect} from 'react';
import {AbsoluteFill, useCurrentFrame, useDelayRender} from 'remotion';

export const queuedFrameCapture = ({
	variant,
	hold,
	onMount,
	onUnmount,
}: {
	variant: 'batch' | 'still' | 'queued';
	hold: {frame: number; promise: Promise<void>; onStarted: () => void} | null;
	onMount: (() => void) | null;
	onUnmount: (() => void) | null;
}) => {
	const Component = () => {
		const frame = useCurrentFrame();
		const {delayRender, continueRender} = useDelayRender();
		useLayoutEffect(() => {
			onMount?.();
			return () => onUnmount?.();
		}, []);
		useLayoutEffect(() => {
			if (!hold || frame !== hold.frame) return;
			const handle = delayRender('Holding queued-capture fixture');
			let active = true;
			hold.onStarted();
			hold.promise.then(() => {
				if (active) continueRender(handle);
			});

			return () => {
				active = false;
				continueRender(handle);
			};
		}, [frame, delayRender, continueRender]);
		const backgroundColor = {
			batch: `rgb(${32 + frame * 17}, 80, 144)`,
			still: `rgb(176, ${40 + frame * 13}, 64)`,
			queued: `rgb(48, 160, ${56 + frame * 11})`,
		}[variant];
		return (
			<AbsoluteFill style={{backgroundColor}}>
				<div
					style={{
						position: 'absolute',
						left: 5 + frame,
						top: 7,
						width: 17,
						height: 19,
						backgroundColor: '#f2d530',
					}}
				/>
			</AbsoluteFill>
		);
	};

	return {
		component: Component,
		id: `queued-frame-capture-${variant}`,
		width: 64,
		height: 48,
		fps: 30,
		durationInFrames: 8,
	} as const;
};

export const queuedFrameCapturePreview = queuedFrameCapture({
	variant: 'batch',
	hold: null,
	onMount: null,
	onUnmount: null,
});
