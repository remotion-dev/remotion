import type {RootState} from '@react-three/fiber';
import {Canvas, useThree} from '@react-three/fiber';
import React, {useCallback, useEffect, useLayoutEffect, useState} from 'react';
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

const ManualFrameRenderer = () => {
	const {advance} = useThree();
	const frame = useCurrentFrame();
	const {delayRender, continueRender} = useDelayRender();

	useEffect(() => {
		if (frame === 0) {
			return;
		}

		const handle = delayRender(`Waiting for R3F to render frame ${frame}`);
		advance(performance.now());
		continueRender(handle);
	}, [frame, advance, delayRender, continueRender]);

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

	const [waitForCreated] = useState(() =>
		delayRender('Waiting for <ThreeCanvas/> to be created'),
	);

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
					{isRendering && <ManualFrameRenderer />}
					{children}
				</Internals.RemotionContextProvider>
			</Canvas>
		</SuspenseLoader>
	);
};
