import type {RootState} from '@react-three/fiber';
import {Canvas, useThree} from '@react-three/fiber';
import React, {useCallback, useLayoutEffect, useState} from 'react';
import {Internals, continueRender, delayRender} from 'remotion';
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

/*
 * @description A wrapper for React Three Fiber's <Canvas /> which synchronizes with Remotion's useCurrentFrame().
 * @see [Documentation](https://www.remotion.dev/docs/three-canvas)
 */
export const ThreeCanvas = (props: ThreeCanvasProps) => {
	const {children, width, height, style, onCreated, ...rest} = props;
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
		[onCreated, waitForCreated],
	);

	return (
		<SuspenseLoader>
			<Canvas style={actualStyle} {...rest} onCreated={remotion_onCreated}>
				<Scale width={width} height={height} />
				<Internals.RemotionContextProvider contexts={contexts}>
					{children}
				</Internals.RemotionContextProvider>
			</Canvas>
		</SuspenseLoader>
	);
};
