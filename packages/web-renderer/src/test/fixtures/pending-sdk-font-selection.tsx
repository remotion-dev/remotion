import {loadFont} from '@remotion/fonts';
import {useLayoutEffect, useRef} from 'react';

export const pendingSdkRoboto = new URL(
	'../../../../example/public/Roboto-Medium.ttf',
	import.meta.url,
).href;
export const pendingSdkBangers = new URL(
	'../../../../example/public/bangers.woff2',
	import.meta.url,
).href;
export const pendingSdkFontSelectionScene = (
	family: string,
	weight: string,
	text: string,
	observation: {
		onRead: ((element: SVGTextElement) => void) | null;
		onBeforeUnmount: ((element: SVGTextElement) => void) | null;
	} | null,
) => {
	const Component = () => {
		const ref = useRef<SVGTextElement>(null);
		useLayoutEffect(() => {
			const element = ref.current;
			if (element) observation?.onRead?.(element);
			return () => {
				if (element) observation?.onBeforeUnmount?.(element);
			};
		}, []);
		return (
			<svg width={320} height={100} style={{backgroundColor: 'white'}}>
				<text
					ref={ref}
					x={12}
					y={60}
					style={{
						fontFamily: `${JSON.stringify(family)},monospace`,
						fontWeight: weight,
						fontSize: 36,
						fill: '#1572ab',
					}}
				>
					{text}
				</text>
			</svg>
		);
	};

	return {
		component: Component,
		id: 'pending-sdk-font-selection',
		width: 320,
		height: 100,
		fps: 30,
		durationInFrames: 1,
	} as const;
};

const previewFamily = 'Pending SDK selection preview';
const Preview = () => {
	useLayoutEffect(() => {
		loadFont({family: previewFamily, url: pendingSdkRoboto, weight: '400'});
		loadFont({family: previewFamily, url: pendingSdkBangers, weight: '700'});
	}, []);
	const Scene = pendingSdkFontSelectionScene(
		previewFamily,
		'700',
		'Review font',
		null,
	).component;
	return <Scene />;
};

export const pendingSdkFontSelection = {
	...pendingSdkFontSelectionScene(previewFamily, '700', 'Review font', null),
	component: Preview,
};
