import type {RootState} from '@react-three/fiber';
import {Canvas, useThree} from '@react-three/fiber';
import React, {
	useCallback,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
} from 'react';
import {
	Internals,
	useCurrentFrame,
	useDelayRender,
	useRemotionEnvironment,
} from 'remotion';
import {SuspenseLoader} from './SuspenseLoader';
import {validateDimension} from './validate';

export type ThreeCanvasProps = React.ComponentProps<typeof Canvas> & {
	readonly width: number;
	readonly height: number;
	readonly children: React.ReactNode;
};

const Scale = ({
	width,
	height,
}: {
	readonly width: number;
	readonly height: number;
}) => {
	const {set, setSize: threeSetSize} = useThree();
	const [setSize] = useState(() => threeSetSize);
	useLayoutEffect(() => {
		setSize(width, height);
		set({setSize: () => null});
		return () => set({setSize});
	}, [setSize, width, height, set]);
	return null;
};

const ManualFrameRenderer = ({
	onRendered,
}: {
	readonly onRendered: () => void;
}) => {
	const {advance} = useThree();
	const frame = useCurrentFrame();

	useEffect(() => {
		advance(performance.now());
		onRendered();
	}, [frame, advance, onRendered]);

	return null;
};

/*
 * @description A wrapper for React Three Fiber's <Canvas /> which synchronizes with Remotion's useCurrentFrame().
 * @see [Documentation](https://www.remotion.dev/docs/three-canvas)
 */
export const ThreeCanvas = (props: ThreeCanvasProps) => {
	const {children, width, height, style, onCreated, ...rest} = props;
	const {isRendering} = useRemotionEnvironment();
	const {delayRender, continueRender} = useDelayRender();
	const contexts = Internals.useRemotionContexts();
	const frame = useCurrentFrame();

	const [waitForCreated] = useState(() =>
		delayRender('Waiting for <ThreeCanvas/> to be created'),
	);
	const frameDelayHandle = useRef<number | null>(null);

	validateDimension(width, 'width', 'of the <ThreeCanvas /> component');
	validateDimension(height, 'height', 'of the <ThreeCanvas /> component');

	const actualStyle = {
		width,
		height,
		...style,
	};

	const remotion_onCreated: typeof onCreated = useCallback(
		(state: RootState) => {
			if (isRendering) {
				state.advance(performance.now());
			}

			continueRender(waitForCreated);
			onCreated?.(state);
		},
		[onCreated, waitForCreated, continueRender, isRendering],
	);

	useLayoutEffect(() => {
		if (!isRendering || frame === 0) {
			return;
		}

		frameDelayHandle.current = delayRender(
			`Waiting for R3F to render frame ${frame}`,
		);

		return () => {
			if (frameDelayHandle.current !== null) {
				continueRender(frameDelayHandle.current);
			}
		};
	}, [frame, isRendering, delayRender, continueRender]);

	const handleRendered = useCallback(() => {
		if (frameDelayHandle.current !== null) {
			continueRender(frameDelayHandle.current);
			frameDelayHandle.current = null;
		}
	}, [continueRender]);

	return (
		<SuspenseLoader>
			<Canvas
				style={actualStyle}
				{...rest}
				frameloop={isRendering ? 'never' : 'always'}
				onCreated={remotion_onCreated}
			>
				<Scale width={width} height={height} />
				<Internals.RemotionContextProvider contexts={contexts}>
					{isRendering && <ManualFrameRenderer onRendered={handleRendered} />}
					{children}
				</Internals.RemotionContextProvider>
			</Canvas>
		</SuspenseLoader>
	);
};
