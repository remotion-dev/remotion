import {
	aroundCenterPoint,
	makeMatrix3dTransform,
	reduceMatrices,
	rotateX,
	rotateY,
	rotateZ,
	scaled,
	translateX,
	translateY,
	translateZ,
} from '@remotion/svg-3d-engine';
import React from 'react';
import {
	Interactive,
	Sequence,
	type InteractiveBaseProps,
	type InteractiveTransformProps,
	type InteractivitySchema,
	type InteractivitySchemaField,
	type SequenceControls,
} from 'remotion';
import {DivExtrusion} from './DivExtrusion';
import {Face} from './FrontFace';
import {RectProvider} from './path-context';
import {BottomSide, TopSide} from './TopSide';
import {
	CenterPointContext,
	TransformContext,
	transformPoint,
	useTransformations,
} from './transformation-context';
import {isBacksideVisible} from './viewing-frontside';

type ExtrudeDivOptionalProps = Partial<{
	readonly width: number;
	readonly height: number;
	readonly depth: number;
	readonly cornerRadius: number;
	readonly backFace: React.ReactNode;
	readonly topFace: React.ReactNode;
	readonly bottomFace: React.ReactNode;
	readonly stack: string;
}>;

type ExtrudeDivTransformProps = Partial<{
	readonly translationX: number;
	readonly translationY: number;
	readonly translationZ: number;
	readonly rotationX: number;
	readonly rotationY: number;
	readonly rotationZ: number;
	readonly scaleX: number;
	readonly scaleY: number;
	readonly scaleZ: number;
}>;

type ExtrudeDivProps = InteractiveBaseProps &
	InteractiveTransformProps &
	ExtrudeDivTransformProps &
	ExtrudeDivOptionalProps & {
		readonly children: React.ReactNode;
	};

const pixelTransformField = (
	description: string,
): InteractivitySchemaField => ({
	type: 'number',
	step: 1,
	default: 0,
	description,
	hiddenFromList: false,
});

const radiansTransformField = (
	description: string,
): InteractivitySchemaField => ({
	type: 'number',
	step: 0.01,
	default: 0,
	description,
	hiddenFromList: false,
});

const scaleTransformField = (
	description: string,
): InteractivitySchemaField => ({
	type: 'number',
	min: 0,
	step: 0.01,
	default: 1,
	description,
	hiddenFromList: false,
});

const extrudeDivSchema = {
	...Interactive.baseSchema,
	width: {
		type: 'number',
		min: 1,
		step: 1,
		default: 200,
		description: 'Width',
		hiddenFromList: false,
	},
	height: {
		type: 'number',
		min: 1,
		step: 1,
		default: 100,
		description: 'Height',
		hiddenFromList: false,
	},
	depth: {
		type: 'number',
		min: 0,
		step: 1,
		default: 40,
		description: 'Depth',
		hiddenFromList: false,
	},
	translationX: pixelTransformField('Translation X'),
	translationY: pixelTransformField('Translation Y'),
	translationZ: pixelTransformField('Translation Z'),
	rotationX: radiansTransformField('Rotation X (radians)'),
	rotationY: radiansTransformField('Rotation Y (radians)'),
	rotationZ: radiansTransformField('Rotation Z (radians)'),
	scaleX: scaleTransformField('Scale X'),
	scaleY: scaleTransformField('Scale Y'),
	scaleZ: scaleTransformField('Scale Z'),
	...Interactive.transformSchema,
} as const satisfies InteractivitySchema;

const setRef = <ElementType,>(
	ref: React.ForwardedRef<ElementType>,
	value: ElementType | null,
) => {
	if (typeof ref === 'function') {
		ref(value);
	} else if (ref) {
		ref.current = value;
	}
};

const numberWithUnitPattern =
	/^([+-]?(?:\d+\.?\d*|\.\d+))(px|%|deg|rad|turn|grad)$/i;
const numberPattern = /^[+-]?(?:\d+\.?\d*|\.\d+)$/;

const parsePixelValue = (value: unknown): number | null => {
	if (typeof value === 'number') {
		return Number.isFinite(value) ? value : null;
	}

	if (typeof value !== 'string') {
		return null;
	}

	const trimmed = value.trim();
	if (trimmed === '0') {
		return 0;
	}

	const match = trimmed.match(numberWithUnitPattern);
	if (!match || match[2].toLowerCase() !== 'px') {
		return null;
	}

	const parsed = Number(match[1]);
	return Number.isFinite(parsed) ? parsed : null;
};

const parseTranslateValue = (
	value: React.CSSProperties['translate'] | undefined,
): readonly [number, number, number] => {
	if (value === undefined || value === null || value === 'none') {
		return [0, 0, 0];
	}

	if (typeof value === 'number') {
		return Number.isFinite(value) ? [value, 0, 0] : [0, 0, 0];
	}

	const parts = String(value).trim().split(/\s+/);
	const x = parsePixelValue(parts[0]) ?? 0;
	const y = parts[1] === undefined ? 0 : (parsePixelValue(parts[1]) ?? 0);
	const z = parts[2] === undefined ? 0 : (parsePixelValue(parts[2]) ?? 0);

	return [x, y, z];
};

const parseScaleValue = (
	value: React.CSSProperties['scale'] | undefined,
): readonly [number, number, number] => {
	if (value === undefined || value === null || value === 'none') {
		return [1, 1, 1];
	}

	if (typeof value === 'number') {
		return Number.isFinite(value) ? [value, value, 1] : [1, 1, 1];
	}

	const parts = String(value).trim().split(/\s+/);
	if (parts.length < 1 || parts.length > 3 || parts[0] === '') {
		return [1, 1, 1];
	}

	const parsed = parts.map((part) => Number(part));
	if (!parsed.every((part) => Number.isFinite(part))) {
		return [1, 1, 1];
	}

	return [parsed[0], parsed[1] ?? parsed[0], parsed[2] ?? 1];
};

const rotationUnitToRadians: Record<string, number> = {
	deg: Math.PI / 180,
	grad: Math.PI / 200,
	rad: 1,
	turn: Math.PI * 2,
};

const parseRotationValue = (
	value: React.CSSProperties['rotate'] | undefined,
): number => {
	if (value === undefined || value === null || value === 'none') {
		return 0;
	}

	if (typeof value === 'number') {
		return Number.isFinite(value) ? value * rotationUnitToRadians.deg : 0;
	}

	const trimmed = String(value).trim();
	const unitMatch = trimmed.match(numberWithUnitPattern);
	if (unitMatch) {
		const amount = Number(unitMatch[1]);
		const unit = unitMatch[2].toLowerCase();
		const factor = rotationUnitToRadians[unit];
		return Number.isFinite(amount) && factor !== undefined
			? amount * factor
			: 0;
	}

	if (numberPattern.test(trimmed)) {
		return Number(trimmed) * rotationUnitToRadians.deg;
	}

	return 0;
};

type OriginAxis = {
	readonly value: number;
	readonly unit: '%' | 'px';
};

const centerOrigin: OriginAxis = {value: 50, unit: '%'};

const parseOriginAxis = (value: string): OriginAxis | null => {
	const lower = value.toLowerCase();
	if (lower === 'center') {
		return centerOrigin;
	}

	if (lower === 'left' || lower === 'top') {
		return {value: 0, unit: '%'};
	}

	if (lower === 'right' || lower === 'bottom') {
		return {value: 100, unit: '%'};
	}

	const match = value.match(numberWithUnitPattern);
	if (!match) {
		return null;
	}

	const unit = match[2].toLowerCase();
	if (unit !== 'px' && unit !== '%') {
		return null;
	}

	const parsed = Number(match[1]);
	return Number.isFinite(parsed) ? {value: parsed, unit} : null;
};

const originAxisToPixels = (axis: OriginAxis, size: number): number => {
	return axis.unit === '%' ? (axis.value / 100) * size : axis.value;
};

const parseTransformOriginValue = ({
	height,
	value,
	width,
}: {
	readonly height: number;
	readonly value: React.CSSProperties['transformOrigin'] | undefined;
	readonly width: number;
}): readonly [number, number, number] => {
	if (value === undefined || value === null) {
		return [width / 2, height / 2, 0];
	}

	const parts = String(value).trim().split(/\s+/);
	if (parts.length < 1 || parts.length > 3 || parts[0] === '') {
		return [width / 2, height / 2, 0];
	}

	const first = parseOriginAxis(parts[0]) ?? centerOrigin;
	const second =
		parts[1] === undefined
			? centerOrigin
			: (parseOriginAxis(parts[1]) ?? centerOrigin);
	const z = parts[2] === undefined ? 0 : (parsePixelValue(parts[2]) ?? 0);

	return [
		originAxisToPixels(first, width),
		originAxisToPixels(second, height),
		z,
	];
};

const getTransformStyle = ({
	height,
	rotate,
	rotationX,
	rotationY,
	rotationZ,
	scale,
	scaleX: localScaleX,
	scaleY: localScaleY,
	scaleZ: localScaleZ,
	transformOrigin,
	translate,
	translationX,
	translationY,
	translationZ,
	width,
}: {
	readonly height: number;
	readonly rotate: React.CSSProperties['rotate'] | undefined;
	readonly rotationX: number;
	readonly rotationY: number;
	readonly rotationZ: number;
	readonly scale: React.CSSProperties['scale'] | undefined;
	readonly scaleX: number;
	readonly scaleY: number;
	readonly scaleZ: number;
	readonly transformOrigin: React.CSSProperties['transformOrigin'] | undefined;
	readonly translate: React.CSSProperties['translate'] | undefined;
	readonly translationX: number;
	readonly translationY: number;
	readonly translationZ: number;
	readonly width: number;
}) => {
	const [translateXPx, translateYPx, translateZPx] =
		parseTranslateValue(translate);
	const [styleScaleX, styleScaleY, styleScaleZ] = parseScaleValue(scale);
	const rotateRadians = parseRotationValue(rotate);
	const [originX, originY, originZ] = parseTransformOriginValue({
		height,
		value: transformOrigin,
		width,
	});

	return aroundCenterPoint({
		matrix: reduceMatrices([
			translateX(translateXPx + translationX),
			translateY(translateYPx + translationY),
			translateZ(translateZPx + translationZ),
			rotateX(rotationX),
			rotateY(rotationY),
			rotateZ(rotateRadians + rotationZ),
			scaled([
				styleScaleX * localScaleX,
				styleScaleY * localScaleY,
				styleScaleZ * localScaleZ,
			]),
		]),
		x: originX,
		y: originY,
		z: originZ,
	});
};

const ExtrudeDivInner = React.forwardRef<
	HTMLDivElement,
	ExtrudeDivProps & {
		readonly controls: SequenceControls | undefined;
	}
>(
	(
		{
			children,
			width = 200,
			height = 100,
			depth = 40,
			cornerRadius = 0,
			backFace,
			style,
			translationX = 0,
			translationY = 0,
			translationZ = 0,
			rotationX = 0,
			rotationY = 0,
			rotationZ = 0,
			scaleX = 1,
			scaleY = 1,
			scaleZ = 1,
			topFace,
			bottomFace,
			durationInFrames,
			from,
			trimBefore,
			freeze,
			hidden,
			name,
			showInTimeline,
			stack,
			controls,
		},
		ref,
	) => {
		const parentTransform = useTransformations();
		const parentCenterPoint = React.useContext(CenterPointContext);
		const localTranslate = style?.translate;
		const localScale = style?.scale;
		const localRotate = style?.rotate;
		const localTransformOrigin = style?.transformOrigin;
		const localTransform = React.useMemo(() => {
			return getTransformStyle({
				height,
				rotate: localRotate,
				rotationX,
				rotationY,
				rotationZ,
				scale: localScale,
				scaleX,
				scaleY,
				scaleZ,
				transformOrigin: localTransformOrigin,
				translate: localTranslate,
				translationX,
				translationY,
				translationZ,
				width,
			});
		}, [
			height,
			localRotate,
			localScale,
			localTransformOrigin,
			localTranslate,
			rotationX,
			rotationY,
			rotationZ,
			scaleX,
			scaleY,
			scaleZ,
			translationX,
			translationY,
			translationZ,
			width,
		]);
		const combinedTransform = React.useMemo(() => {
			return reduceMatrices([parentTransform, localTransform]);
		}, [localTransform, parentTransform]);
		const combinedCenterPoint = React.useMemo(() => {
			return transformPoint({matrix: localTransform, point: parentCenterPoint});
		}, [localTransform, parentCenterPoint]);
		const frontFace = isBacksideVisible(combinedTransform);
		const outlineRef = React.useRef<HTMLDivElement | null>(null);
		const callbackRef = React.useCallback(
			(element: HTMLDivElement | null) => {
				if (depth === 0) {
					outlineRef.current = element;
				}

				setRef(ref, element);
			},
			[depth, ref],
		);

		return (
			<Sequence
				layout="none"
				from={from ?? 0}
				trimBefore={trimBefore}
				durationInFrames={durationInFrames ?? Infinity}
				freeze={freeze}
				hidden={hidden}
				name={name ?? '<ExtrudeDiv>'}
				showInTimeline={showInTimeline ?? true}
				controls={controls ?? undefined}
				_remotionInternalStack={stack}
				_remotionInternalDocumentationLink="https://www.remotion.dev/docs/studio/make-component-interactive"
				outlineRef={outlineRef}
			>
				<TransformContext.Provider value={combinedTransform}>
					<CenterPointContext.Provider value={combinedCenterPoint}>
						<RectProvider
							height={height}
							width={width}
							cornerRadius={cornerRadius}
						>
							<div
								ref={callbackRef}
								style={{
									...style,
									width,
									height,
									position: 'relative',
									transform:
										depth === 0
											? makeMatrix3dTransform(combinedTransform)
											: undefined,
									transformOrigin: undefined,
									translate: undefined,
									rotate: undefined,
									scale: undefined,
								}}
							>
								{depth > 0 ? <DivExtrusion depth={depth} /> : children}
								{depth === 0 ? null : !frontFace ? (
									<Face type="front" depth={depth} outlineRef={outlineRef}>
										{children}
									</Face>
								) : (
									<Face type="back" depth={depth} outlineRef={outlineRef}>
										{backFace}
									</Face>
								)}
								{topFace ? (
									<TopSide depth={depth} width={width} height={height}>
										{topFace}
									</TopSide>
								) : null}
								{bottomFace ? (
									<BottomSide depth={depth} width={width} height={height}>
										{bottomFace}
									</BottomSide>
								) : null}
							</div>
						</RectProvider>
					</CenterPointContext.Provider>
				</TransformContext.Provider>
			</Sequence>
		);
	},
);

ExtrudeDivInner.displayName = '<ExtrudeDiv>';

export const ExtrudeDiv = Interactive.withSchema({
	Component: ExtrudeDivInner,
	componentName: '<ExtrudeDiv>',
	componentIdentity: null,
	schema: extrudeDivSchema,
	supportsEffects: false,
});

ExtrudeDiv.displayName = 'ExtrudeDiv';

export const ThreeDiv: React.FC<React.HtmlHTMLAttributes<HTMLDivElement>> = ({
	style,
	...props
}) => {
	return (
		<div
			{...props}
			style={{...style, transform: makeMatrix3dTransform(useTransformations())}}
		/>
	);
};
