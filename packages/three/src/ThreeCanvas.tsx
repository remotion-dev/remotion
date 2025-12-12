import type {RootState} from '@react-three/fiber';
import {Canvas, useThree} from '@react-three/fiber';
import React, {
	useCallback,
	useEffect,
	useImperativeHandle,
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

const FiberFrameInvalidator = () => {
	const {invalidate} = useThree();

	const frame = useCurrentFrame();

	useEffect(() => {
		invalidate();
	}, [frame, invalidate]);

	return null;
};

type InvalidatorRef = {
	readonly invalidate: () => void;
};

const Invalidator = React.forwardRef<InvalidatorRef, {}>((_, ref) => {
	const {invalidate} = useThree();

	useImperativeHandle(ref, () => {
		return {
			invalidate,
		};
	}, [invalidate]);

	return null;
});

export type ThreeCanvasRef = {
	invalidate: () => void;
};

/*
 * @description A wrapper for React Three Fiber's <Canvas /> which synchronizes with Remotion's useCurrentFrame().
 * @see [Documentation](https://www.remotion.dev/docs/three-canvas)
 */
export const ThreeCanvas = React.forwardRef<ThreeCanvasRef, ThreeCanvasProps>(
	(props, ref) => {
		const {isRendering} = useRemotionEnvironment();

		// https://r3f.docs.pmnd.rs/advanced/scaling-performance#on-demand-rendering
		const shouldUseFrameloopDemand = isRendering;

		const {children, width, height, style, onCreated, ...rest} = props;
		const {delayRender, continueRender} = useDelayRender();
		const [waitForCreated] = useState(() =>
			delayRender('Waiting for <ThreeCanvas/> to be created'),
		);

		validateDimension(width, 'width', 'of the <ThreeCanvas /> component');
		validateDimension(height, 'height', 'of the <ThreeCanvas /> component');
		const contexts = Internals.useRemotionContexts();
		const actualStyle = {
			width: props.width,
			height: props.height,
			...(style ?? {}),
		};

		const remotion_onCreated: typeof onCreated = useCallback(
			(state: RootState) => {
				continueRender(waitForCreated);
				onCreated?.(state);
			},
			[onCreated, waitForCreated, continueRender],
		);

		const invalidatorRef = useRef<InvalidatorRef>(null);

		React.useImperativeHandle(
			ref,
			() => ({
				invalidate: () => {
					invalidatorRef.current?.invalidate();
				},
			}),
			[],
		);

		return (
			<SuspenseLoader>
				<Canvas
					style={actualStyle}
					{...rest}
					frameloop={shouldUseFrameloopDemand ? 'demand' : 'always'}
					onCreated={remotion_onCreated}
				>
					<Scale width={width} height={height} />
					<Internals.RemotionContextProvider contexts={contexts}>
						{shouldUseFrameloopDemand && <FiberFrameInvalidator />}
						<Invalidator ref={invalidatorRef} />
						{children}
					</Internals.RemotionContextProvider>
				</Canvas>
			</SuspenseLoader>
		);
	},
);

ThreeCanvas.displayName = 'ThreeCanvas';
