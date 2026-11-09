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

const structuralVariants = [
	'nth-child',
	'nth-last-child',
	'empty',
	'empty-source',
	'whitespace-source',
	'comment-source',
] as const;
const StructuralSvg = ({
	kind,
	index,
}: {
	readonly kind: (typeof structuralVariants)[number];
	readonly index: number;
}) => {
	const svg = useRef<SVGSVGElement>(null);
	useLayoutEffect(() => {
		const style =
			svg.current!.querySelector<SVGStyleElement>('[data-disabled]')!;
		if (!style.sheet) throw new Error('Structural stylesheet is not ready');
		style.sheet.disabled = true;
	}, []);
	const selector = `disabled-structural-${kind}`;
	const disabled = (
		<style data-disabled="true">
			{kind === 'empty-source'
				? ''
				: kind === 'whitespace-source'
					? ' \n '
					: kind === 'comment-source'
						? '/* Original CSS comment. */'
						: `.${selector} {fill:red}`}
		</style>
	);
	const active = (
		<style>
			{kind === 'nth-child'
				? `.${selector}:nth-child(3) {fill:lime}`
				: kind === 'nth-last-child'
					? `.${selector}:nth-last-child(2) {fill:lime}`
					: `style:empty + .${selector} {fill:lime}`}
		</style>
	);
	const rect = <rect className={selector} fill="blue" width={24} height={24} />;
	return (
		<svg
			ref={svg}
			width={24}
			height={24}
			style={{position: 'absolute', left: 8 + index * 36, top: 8}}
		>
			{kind === 'nth-child' ? (
				<>
					{disabled}
					{active}
					{rect}
				</>
			) : kind === 'nth-last-child' ? (
				<>
					{active}
					{rect}
					{disabled}
				</>
			) : (
				<>
					{active}
					{disabled}
					{rect}
				</>
			)}
		</svg>
	);
};

const Component = ({opaque = false}: {readonly opaque?: boolean}) => (
	<AbsoluteFill style={{backgroundColor: opaque ? 'black' : undefined}}>
		{variants.map((kind, index) => (
			<StyledSvg key={kind} kind={kind} index={index} />
		))}
		{structuralVariants.map((kind, index) => (
			<StructuralSvg key={kind} kind={kind} index={index + variants.length} />
		))}
	</AbsoluteFill>
);
export const svgDisabledStyles = {
	component: Component,
	id: 'svg-disabled-styles',
	width: 440,
	height: 40,
	fps: 30,
	durationInFrames: 2,
} as const;
export const svgDisabledStylesOpaque = {
	...svgDisabledStyles,
	id: 'svg-disabled-styles-opaque',
	component: () => <Component opaque />,
};
