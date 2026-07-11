import React, {
	createContext,
	createRef,
	useEffect,
	useMemo,
	useState,
} from 'react';
import {continueRender, delayRender} from 'remotion';
import type {ResolvedOptions} from 'roughjs/bin/core';
import {useElementSize} from './element-size';
import {render} from './rough';
import {resolveAnnotationConfig, type AnnotationConfig} from './types';

const AnnotationContext = createContext<{
	readonly svgChildren: React.ReactElement[];
	readonly setSvgChildren: React.Dispatch<
		React.SetStateAction<React.ReactElement[]>
	>;
}>({
	setSvgChildren: () => undefined,
	svgChildren: [],
});

const MEASURER_SIZE = 100;

const measurerSize: React.CSSProperties = {
	height: MEASURER_SIZE,
	width: MEASURER_SIZE,
	position: 'fixed',
	opacity: 0,
	top: -10000,
};

type ChildrenProps = {
	readonly children: React.ReactNode;
};

type TrackerProps = ChildrenProps & {
	readonly style?: React.CSSProperties;
};

type AnnotationProps = Readonly<
	AnnotationConfig & {
		seed?: number;
		progress: number;
		roughness?: number;
		roughOptions?: Partial<ResolvedOptions>;
	}
>;

export const createAnnotation = () => {
	const ref = createRef<HTMLSpanElement>();
	const svgRef = createRef<SVGSVGElement>();
	const measurer = createRef<HTMLDivElement>();

	const Container: React.FC<ChildrenProps> = (props) => {
		const [svgChildren, setSvgChildren] = useState<React.ReactElement[]>([]);

		const value = useMemo(() => {
			return {setSvgChildren, svgChildren};
		}, [svgChildren]);

		return (
			<AnnotationContext.Provider value={value}>
				{props.children}
				<div ref={measurer} style={measurerSize} />
			</AnnotationContext.Provider>
		);
	};

	const Tracker: React.FC<TrackerProps> = ({children, style}) => {
		return (
			<span
				ref={ref}
				style={{
					...style,
					display: 'inline-block',
					position: 'relative',
					whiteSpace: 'pre',
				}}
			>
				{children}
			</span>
		);
	};

	const Annotation: React.FC<AnnotationProps> = ({
		roughOptions,
		roughness,
		seed,
		progress,
		...config
	}) => {
		const parsed = useMemo(() => {
			return resolveAnnotationConfig(config);
		}, [config]);

		const [initial] = useState(() => delayRender());
		const size = useElementSize(ref);

		useEffect(() => {
			if (size === null) {
				return;
			}

			continueRender(initial);
		}, [initial, size]);

		const scale = measurer.current
			? measurer.current.getBoundingClientRect().width / MEASURER_SIZE
			: null;

		const svgChildren =
			ref.current && scale
				? render({
						config: parsed,
						svg: svgRef.current as SVGSVGElement,
						element: ref.current,
						seed: seed ?? 1,
						scale,
						progress,
						options:
							roughness === undefined
								? (roughOptions ?? {})
								: {...roughOptions, roughness},
					})
				: [];

		return (
			<svg
				ref={svgRef}
				style={{
					position: 'absolute',
					top: 0,
					left: 0,
					overflow: 'visible',
					width: 100,
					height: 100,
				}}
			>
				{svgChildren}
			</svg>
		);
	};

	return {Container, Tracker, Annotation};
};
