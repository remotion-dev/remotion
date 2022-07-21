import type {CanvasProps} from '@shopify/react-native-skia';
import {Canvas} from '@shopify/react-native-skia';
import type {ReactNode} from 'react';
import {useMemo} from 'react';
import {Internals} from 'remotion';

type RemotionCanvasProps = CanvasProps & {
	children: ReactNode;
	width: number;
	height: number;
};

export const SkiaCanvas = ({
	children,
	height,
	width,
	...otherProps
}: RemotionCanvasProps) => {
	const contexts = Internals.useRemotionContexts();

	const style = useMemo(() => {
		return {
			width,
			height,
		};
	}, [height, width]);

	return (
		<Canvas {...otherProps} style={style} mode="continuous">
			<Internals.RemotionContextProvider contexts={contexts}>
				{children}
			</Internals.RemotionContextProvider>
		</Canvas>
	);
};
