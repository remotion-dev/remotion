import React, {
	createRef,
	useEffect,
	useLayoutEffect,
	useMemo,
	useState,
} from 'react';
import {continueRender, delayRender, useCurrentFrame} from 'remotion';
import {useElementSize} from './element-size';
import {render} from './rough';
import {
	resolveAnnotationConfig,
	resolveRoughOptions,
	type AnnotationConfig,
	type RoughAnnotationOptions,
} from './types';

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
	} & RoughAnnotationOptions
>;

export const createAnnotation = () => {
	const ref = createRef<HTMLSpanElement>();
	const svgRef = createRef<SVGSVGElement>();
	const Container: React.FC<ChildrenProps> = (props) => {
		return props.children;
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
		roughness,
		maxRandomnessOffset,
		bowing,
		curveFitting,
		curveTightness,
		curveStepCount,
		disableMultiStroke,
		preserveVertices,
		seed,
		progress,
		...config
	}) => {
		const frame = useCurrentFrame();
		const parsedKey = JSON.stringify(resolveAnnotationConfig(config));
		const parsed = useMemo(() => {
			return JSON.parse(parsedKey) as ReturnType<
				typeof resolveAnnotationConfig
			>;
		}, [parsedKey]);
		const roughJsOptions = useMemo(() => {
			return resolveRoughOptions({
				roughness,
				maxRandomnessOffset,
				bowing,
				curveFitting,
				curveTightness,
				curveStepCount,
				disableMultiStroke,
				preserveVertices,
			});
		}, [
			bowing,
			curveFitting,
			curveStepCount,
			curveTightness,
			disableMultiStroke,
			maxRandomnessOffset,
			preserveVertices,
			roughness,
		]);

		const [initial] = useState(() => delayRender());
		const size = useElementSize(ref);

		useEffect(() => {
			if (size === null) {
				return;
			}

			continueRender(initial);
		}, [initial, size]);

		const [svgChildren, setSvgChildren] = useState<React.ReactElement[]>([]);

		useLayoutEffect(() => {
			if (!ref.current || !svgRef.current) {
				setSvgChildren([]);
				return;
			}

			setSvgChildren(
				render({
					config: parsed,
					element: ref.current,
					seed: seed ?? 1,
					progress,
					options: roughJsOptions,
				}),
			);
		}, [frame, parsed, progress, roughJsOptions, seed, size]);

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
