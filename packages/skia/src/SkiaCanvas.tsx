import type {CanvasProps, SkiaDomView} from '@shopify/react-native-skia';
import {Canvas} from '@shopify/react-native-skia';
import type {FunctionComponent, ReactNode, RefAttributes} from 'react';
import React, {useMemo} from 'react';
import type {ViewProps} from 'react-native';
import {Internals} from 'remotion';

type RemotionCanvasProps = CanvasProps & {
	readonly children: ReactNode;
	readonly width: number;
	readonly height: number;
};

/**
 * @description A React Native Skia <Canvas /> component that wraps Remotion contexts.
 * @see [Documentation](https://www.remotion.dev/docs/skia/skia-canvas)
 */
export const SkiaCanvas = ({
	children,
	height,
	width,
	style,
	...otherProps
}: RemotionCanvasProps) => {
	const contexts = Internals.useRemotionContexts();

	const mergedStyles: React.CSSProperties = useMemo(() => {
		return {
			width,
			height,
			...((style as React.CSSProperties) ?? {}),
		};
	}, [height, style, width]);

	const props: Omit<CanvasProps, 'children'> = useMemo(() => {
		return {
			style: mergedStyles as ViewProps['style'],
			...otherProps,
		};
	}, [mergedStyles, otherProps]);

	const FixedCanvas = Canvas as FunctionComponent<
		CanvasProps & RefAttributes<SkiaDomView>
	>;

	return (
		<FixedCanvas {...props}>
			<Internals.RemotionContextProvider contexts={contexts}>
				{children}
			</Internals.RemotionContextProvider>
		</FixedCanvas>
	);
};
