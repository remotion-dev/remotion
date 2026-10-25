import {useLayoutEffect, useRef, useState} from 'react';
import {useCurrentFrame, useDelayRender, useVideoConfig} from 'remotion';
// Share the source renderer so Studio previews update without a homepage rebuild.
// eslint-disable-next-line no-restricted-imports
import {
	type StudioHandoffAssets,
	drawStudioHandoff,
	loadStudioHandoffAssets,
} from '../../../promo-pages/src/components/homepage/studio-handoff/renderer';

export const StudioCodeHandoff: React.FC = () => {
	const frame = useCurrentFrame();
	const {width, height, fps} = useVideoConfig();
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [assets, setAssets] = useState<StudioHandoffAssets | null>(null);
	const {delayRender, continueRender, cancelRender} = useDelayRender();
	const handleRef = useRef<number | null>(null);

	useLayoutEffect(() => {
		const handle = delayRender('Loading Studio handoff images');
		handleRef.current = handle;
		let disposed = false;
		loadStudioHandoffAssets()
			.then((loaded) => {
				if (!disposed) {
					setAssets(loaded);
				}
			})
			.catch((error) => {
				if (!disposed) {
					cancelRender(error);
				}
			});
		return () => {
			disposed = true;
			continueRender(handle);
			if (handleRef.current === handle) {
				handleRef.current = null;
			}
		};
	}, [cancelRender, continueRender, delayRender]);

	useLayoutEffect(() => {
		if (!canvasRef.current || !assets) {
			return;
		}

		drawStudioHandoff(canvasRef.current, frame / fps, assets, null);
		if (handleRef.current !== null) {
			continueRender(handleRef.current);
			handleRef.current = null;
		}
	}, [assets, continueRender, fps, frame, height, width]);

	return (
		<canvas
			ref={canvasRef}
			width={width}
			height={height}
			style={{display: 'block', width: '100%', height: '100%'}}
		/>
	);
};
