import type {RootState} from '@react-three/fiber';
import {Canvas, useThree} from '@react-three/fiber';
import React, {useCallback, useLayoutEffect, useState} from 'react';
import {continueRender, delayRender, Internals} from 'remotion';
import {SuspenseLoader} from './SuspenseLoader';

export type ThreeCanvasProps = React.ComponentProps<typeof Canvas> & {
	width: number;
	height: number;
	children: React.ReactNode;
};

const Scale = ({width, height}: {width: number; height: number}) => {
	const {set, setSize: threeSetSize} = useThree();
	const [setSize] = useState(() => threeSetSize);
	useLayoutEffect(() => {
		setSize(width, height);
		set({setSize: () => null});
		return () => set({setSize});
	}, [setSize, width, height, set]);
	return null;
};

export const ThreeCanvas = (props: ThreeCanvasProps) => {
	const {children, width, height, style, onCreated, ...rest} = props;
	const [waitForCreated] = useState(() =>
		delayRender('Waiting for <ThreeCanvas/> to be created')
	);

	Internals.validateDimension(
		width,
		'width',
		'of the <ThreeCanvas /> component'
	);
	Internals.validateDimension(
		height,
		'height',
		'of the <ThreeCanvas /> component'
	);
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
		[onCreated, waitForCreated]
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
