import { Canvas } from '@react-three/fiber';
import React from 'react';
import { Internals } from 'remotion';

export type ThreeCanvasProps = React.ComponentProps<typeof Canvas>;

export const ThreeCanvas = (props: ThreeCanvasProps) => {
	const { children, ...rest } = props;
	const contexts = Internals.useRemotionContexts();
	return (
		<Canvas {...rest}>
			<Internals.RemotionContextProvider contexts={contexts}>
				{children}
			</Internals.RemotionContextProvider>
		</Canvas>
	);
};
