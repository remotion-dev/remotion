import type {MatrixTransform4D, Vector4D} from '@remotion/svg-3d-engine';
import {
	reduceMatrices,
	rotateX,
	rotateY,
	rotateZ,
	scaled,
	translateX,
	translateY,
	translateZ,
} from '@remotion/svg-3d-engine';
import React, {useContext, useMemo} from 'react';
import {
	Interactive,
	Internals,
	Sequence,
	type InteractiveBaseProps,
	type InteractivitySchema,
	type InteractivitySchemaField,
	type SequenceControls,
} from 'remotion';

type Context = MatrixTransform4D;

export const TransformContext = React.createContext<Context>(scaled(1));
export const CenterPointContext = React.createContext<
	[number, number, number, number]
>([0, 0, 0, 1]);

export function transformPoint({
	matrix,
	point,
}: {
	matrix: MatrixTransform4D;
	point: Vector4D;
}): Vector4D {
	const [x, y, z, w] = point;
	const result: number[] = [];

	for (let i = 0; i < 4; i++) {
		// For row i, the elements are at indices 4*i, 4*i+1, 4*i+2, and 4*i+3
		result[i] =
			matrix[4 * i + 0] * x +
			matrix[4 * i + 1] * y +
			matrix[4 * i + 2] * z +
			matrix[4 * i + 3] * w;
	}

	return [result[0], result[1], result[2], result[3]];
}

export const isTranslateXYTransform = (
	transform: MatrixTransform4D,
): boolean => {
	return (
		transform[0] === 1 &&
		transform[1] === 0 &&
		transform[2] === 0 &&
		// 3 omitted
		transform[4] === 0 &&
		transform[5] === 1 &&
		transform[6] === 0 &&
		// 7 omitted
		transform[8] === 0 &&
		transform[9] === 0 &&
		transform[10] === 1 &&
		transform[11] === 0 &&
		transform[12] === 0 &&
		transform[13] === 0 &&
		transform[14] === 0 &&
		transform[15] === 1
	);
};

export const NewTransform: React.FC<{
	readonly children: React.ReactNode;
	readonly transform: MatrixTransform4D;
}> = ({children, transform}) => {
	const oldValue = React.useContext(TransformContext);
	const point = React.useContext(CenterPointContext);

	const newValue = React.useMemo(() => {
		return reduceMatrices([oldValue, transform]);
	}, [oldValue, transform]);

	const newCenterPoint = React.useMemo(() => {
		return transformPoint({matrix: transform, point});
	}, [point, transform]);

	return (
		<TransformContext.Provider value={newValue}>
			<CenterPointContext.Provider value={newCenterPoint}>
				{children}
			</CenterPointContext.Provider>
		</TransformContext.Provider>
	);
};

type TransformBaseProps = InteractiveBaseProps & {
	readonly children: React.ReactNode;
} & Partial<{
		readonly stack: string;
	}>;

type TransformInnerProps<ValueKey extends string> = TransformBaseProps &
	Readonly<Record<ValueKey, number>> & {
		readonly controls: SequenceControls | undefined;
	};

const transformDocumentationLink =
	'https://www.remotion.dev/docs/studio/make-component-interactive';

const make3DTransform = <ValueKey extends string>({
	componentName,
	valueKey,
	schemaField,
	makeTransform,
	defaultValue,
}: {
	componentName: string;
	valueKey: ValueKey;
	schemaField: InteractivitySchemaField;
	makeTransform: (value: number) => MatrixTransform4D;
	defaultValue: number;
}) => {
	type Props = TransformBaseProps & Readonly<Record<ValueKey, number>>;

	const schema = {
		...Interactive.baseSchema,
		[valueKey]: schemaField,
	} as const satisfies InteractivitySchema;

	const Inner = React.forwardRef<never, TransformInnerProps<ValueKey>>(
		(rawProps, _ref) => {
			const props = rawProps as TransformInnerProps<ValueKey>;
			const {
				children,
				durationInFrames,
				from,
				trimBefore,
				freeze,
				hidden,
				name,
				showInTimeline,
				stack,
				controls,
			} = props;
			const value = props[valueKey] ?? defaultValue;
			const transform = useMemo(() => makeTransform(value), [value]);

			return (
				<Sequence
					layout="none"
					from={from ?? 0}
					trimBefore={trimBefore}
					durationInFrames={durationInFrames ?? Infinity}
					freeze={freeze}
					hidden={hidden}
					name={name ?? componentName}
					showInTimeline={showInTimeline ?? true}
					controls={controls ?? undefined}
					_remotionInternalStack={stack}
					_remotionInternalDocumentationLink={transformDocumentationLink}
				>
					<NewTransform transform={transform}>{children}</NewTransform>
				</Sequence>
			);
		},
	);

	Inner.displayName = componentName;

	const Wrapped = Interactive.withSchema({
		Component: Inner,
		componentName,
		componentIdentity: null,
		schema,
		supportsEffects: false,
	}) as unknown as React.FC<Props>;

	Wrapped.displayName = componentName.slice(1, -1);
	Internals.addSequenceStackTraces(Wrapped);

	return Wrapped;
};

export const RotateX = make3DTransform({
	componentName: '<RotateX>',
	valueKey: 'radians',
	defaultValue: 0,
	schemaField: {
		type: 'number',
		step: 0.01,
		default: 0,
		description: 'Radians',
		hiddenFromList: false,
	},
	makeTransform: rotateX,
});

export const RotateZ = make3DTransform({
	componentName: '<RotateZ>',
	valueKey: 'radians',
	defaultValue: 0,
	schemaField: {
		type: 'number',
		step: 0.01,
		default: 0,
		description: 'Radians',
		hiddenFromList: false,
	},
	makeTransform: rotateZ,
});

export const TranslateY = make3DTransform({
	componentName: '<TranslateY>',
	valueKey: 'px',
	defaultValue: 0,
	schemaField: {
		type: 'number',
		step: 1,
		default: 0,
		description: 'Pixels',
		hiddenFromList: false,
	},
	makeTransform: translateY,
});

export const TranslateX = make3DTransform({
	componentName: '<TranslateX>',
	valueKey: 'px',
	defaultValue: 0,
	schemaField: {
		type: 'number',
		step: 1,
		default: 0,
		description: 'Pixels',
		hiddenFromList: false,
	},
	makeTransform: translateX,
});

export const TranslateZ = make3DTransform({
	componentName: '<TranslateZ>',
	valueKey: 'px',
	defaultValue: 0,
	schemaField: {
		type: 'number',
		step: 1,
		default: 0,
		description: 'Pixels',
		hiddenFromList: false,
	},
	makeTransform: translateZ,
});

export const RotateY = make3DTransform({
	componentName: '<RotateY>',
	valueKey: 'radians',
	defaultValue: 0,
	schemaField: {
		type: 'number',
		step: 0.01,
		default: 0,
		description: 'Radians',
		hiddenFromList: false,
	},
	makeTransform: rotateY,
});

export const Scale = make3DTransform({
	componentName: '<Scale>',
	valueKey: 'factor',
	defaultValue: 1,
	schemaField: {
		type: 'number',
		min: 0,
		step: 0.01,
		default: 1,
		description: 'Factor',
		hiddenFromList: false,
	},
	makeTransform: scaled,
});

export const useTransformations = () => {
	return useContext(TransformContext);
};

export const useCenterPoint = () => {
	return useContext(CenterPointContext);
};
