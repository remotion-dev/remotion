import { Canvas, useThree } from '@react-three/fiber';
import React, { useLayoutEffect, useState } from 'react';
import { Internals } from 'remotion';
import { SuspenseLoader } from './SuspenseLoader';

export type ThreeCanvasProps = React.ComponentProps<typeof Canvas> & {
	width: number;
	height: number;
};

const Scale = ({ width, height }: { width: number; height: number }) => {
	const { set, setSize: threeSetSize } = useThree();
	const [setSize] = useState(() => threeSetSize);
	useLayoutEffect(() => {
		setSize(width, height);
		set({ setSize: () => null });
		return () => set({ setSize });
	}, [setSize, width, height, set]);
	return null;
};

export const ThreeCanvas = (props: ThreeCanvasProps) => {
	const { children, width, height, style, ...rest } = props;
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
	return (
		<SuspenseLoader>
			<Canvas style={actualStyle} {...rest}>
				<Scale width={width} height={height} />
				<Internals.RemotionContextProvider contexts={contexts}>
					{children}
				</Internals.RemotionContextProvider>
			</Canvas>
		</SuspenseLoader>
	);
};
