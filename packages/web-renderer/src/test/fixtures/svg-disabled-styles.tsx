import {useLayoutEffect, useRef} from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';

const variants = [
	'disabled',
	'enabled',
	'disabled-first',
	'disabled-last',
	'nested',
	'toggle',
] as const;
const StyledSvg = ({
	kind,
	index,
}: {
	readonly kind: (typeof variants)[number];
	readonly index: number;
}) => {
	const frame = useCurrentFrame();
	const first = useRef<HTMLStyleElement>(null);
	const last = useRef<HTMLStyleElement>(null);
	useLayoutEffect(() => {
		if (!first.current?.sheet) throw new Error('SVG stylesheet is not ready');
		first.current.sheet.disabled =
			kind === 'disabled' ||
			kind === 'disabled-first' ||
			kind === 'nested' ||
			(kind === 'toggle' && frame === 0);
		if (last.current?.sheet)
			last.current.sheet.disabled = kind === 'disabled-last';
	}, [kind, frame]);
	const contents = (
		<>
			<style ref={first}>{`.disabled-style-${index} { fill: red; }`}</style>
			{kind === 'disabled-first' || kind === 'disabled-last' ? (
				<style ref={last}>{`.disabled-style-${index} { fill: lime; }`}</style>
			) : null}
			<rect
				className={`disabled-style-${index}`}
				fill="blue"
				width={24}
				height={24}
			/>
		</>
	);
	return (
		<svg
			width={24}
			height={24}
			style={{position: 'absolute', left: 8 + index * 36, top: 8}}
		>
			{kind === 'nested' ? (
				<svg width={24} height={24}>
					{contents}
				</svg>
			) : (
				contents
			)}
		</svg>
	);
};

const Component = ({opaque = false}: {readonly opaque?: boolean}) => (
	<AbsoluteFill style={{backgroundColor: opaque ? 'black' : undefined}}>
		{variants.map((kind, index) => (
			<StyledSvg key={kind} kind={kind} index={index} />
		))}
	</AbsoluteFill>
);
export const svgDisabledStyles = {
	component: Component,
	id: 'svg-disabled-styles',
	width: 224,
	height: 40,
	fps: 30,
	durationInFrames: 2,
} as const;
export const svgDisabledStylesOpaque = {
	...svgDisabledStyles,
	id: 'svg-disabled-styles-opaque',
	component: () => <Component opaque />,
};
