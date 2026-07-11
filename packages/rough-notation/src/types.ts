export type Rect = {
	readonly x: number;
	readonly y: number;
	readonly w: number;
	readonly h: number;
};

export type Padding = {
	readonly left: number;
	readonly right: number;
	readonly top: number;
	readonly bottom: number;
};

export type Bracket = 'left' | 'right' | 'top' | 'bottom';
export type Box = 'inside' | 'around';

type SharedConfig = {
	readonly color?: string;
	readonly strokeWidth?: number;
};

type PaddingConfig = {
	readonly padding?: Partial<Padding>;
};

type IterationConfig = {
	readonly iterations?: number;
};

type RtlConfig = {
	readonly rtl?: boolean;
};

export type AnnotationConfig =
	| {
			readonly type: 'none';
	  }
	| ({
			readonly type: 'underline';
	  } & SharedConfig &
			PaddingConfig &
			IterationConfig &
			RtlConfig)
	| ({
			readonly type: 'strike-through';
	  } & SharedConfig &
			IterationConfig &
			RtlConfig)
	| ({
			readonly type: 'box';
	  } & SharedConfig &
			PaddingConfig &
			IterationConfig)
	| ({
			readonly type: 'bracket';
			readonly brackets?: readonly Bracket[];
	  } & SharedConfig &
			PaddingConfig)
	| ({
			readonly type: 'crossed-off';
	  } & SharedConfig &
			IterationConfig &
			RtlConfig)
	| ({
			readonly type: 'circle';
			readonly box?: Box;
	  } & SharedConfig &
			PaddingConfig &
			IterationConfig)
	| ({
			readonly type: 'highlight';
	  } & SharedConfig &
			PaddingConfig &
			IterationConfig &
			RtlConfig);

type ResolvedSharedConfig = {
	readonly color: string;
	readonly strokeWidth: number;
};

type ResolvedPaddingConfig = {
	readonly padding: Padding;
};

type ResolvedIterationConfig = {
	readonly iterations: number;
};

type ResolvedRtlConfig = {
	readonly rtl: boolean;
};

export type ResolvedAnnotationConfig =
	| {
			readonly type: 'none';
	  }
	| ({
			readonly type: 'underline';
	  } & ResolvedSharedConfig &
			ResolvedPaddingConfig &
			ResolvedIterationConfig &
			ResolvedRtlConfig)
	| ({
			readonly type: 'strike-through';
	  } & ResolvedSharedConfig &
			ResolvedIterationConfig &
			ResolvedRtlConfig)
	| ({
			readonly type: 'box';
	  } & ResolvedSharedConfig &
			ResolvedPaddingConfig &
			ResolvedIterationConfig)
	| ({
			readonly type: 'bracket';
			readonly brackets: readonly Bracket[];
	  } & ResolvedSharedConfig &
			ResolvedPaddingConfig)
	| ({
			readonly type: 'crossed-off';
	  } & ResolvedSharedConfig &
			ResolvedIterationConfig &
			ResolvedRtlConfig)
	| ({
			readonly type: 'circle';
			readonly box: Box;
	  } & ResolvedSharedConfig &
			ResolvedPaddingConfig &
			ResolvedIterationConfig)
	| ({
			readonly type: 'highlight';
	  } & Omit<ResolvedSharedConfig, 'strokeWidth'> &
			ResolvedPaddingConfig &
			ResolvedIterationConfig &
			ResolvedRtlConfig);

const defaultPadding: Padding = {
	bottom: 0,
	left: 0,
	right: 0,
	top: 0,
};

const resolvePadding = (padding: Partial<Padding> | undefined): Padding => {
	return {
		...defaultPadding,
		...padding,
	};
};

const resolveIterations = (
	iterations: number | undefined,
	defaultIterations: number,
): number => {
	if (iterations === undefined) {
		return defaultIterations;
	}

	if (!Number.isInteger(iterations) || iterations < 1) {
		throw new TypeError('iterations must be an integer of at least 1');
	}

	return iterations;
};

const shared = ({
	color,
	strokeWidth,
	defaultStrokeWidth,
}: SharedConfig & {
	readonly defaultStrokeWidth: number;
}) => {
	return {
		color: color ?? 'currentColor',
		strokeWidth: strokeWidth ?? defaultStrokeWidth,
	};
};

export const resolveAnnotationConfig = (
	config: AnnotationConfig,
): ResolvedAnnotationConfig => {
	if (config.type === 'none') {
		return config;
	}

	if (config.type === 'underline') {
		return {
			type: 'underline',
			...shared({...config, defaultStrokeWidth: 20}),
			padding: resolvePadding(config.padding),
			iterations: resolveIterations(config.iterations, 2),
			rtl: config.rtl ?? false,
		};
	}

	if (config.type === 'strike-through') {
		return {
			type: 'strike-through',
			...shared({...config, defaultStrokeWidth: 20}),
			iterations: resolveIterations(config.iterations, 1),
			rtl: config.rtl ?? false,
		};
	}

	if (config.type === 'box') {
		return {
			type: 'box',
			...shared({...config, defaultStrokeWidth: 7}),
			padding: resolvePadding(config.padding),
			iterations: resolveIterations(config.iterations, 2),
		};
	}

	if (config.type === 'bracket') {
		return {
			type: 'bracket',
			...shared({...config, defaultStrokeWidth: 20}),
			padding: resolvePadding(config.padding),
			brackets: config.brackets ?? ['right'],
		};
	}

	if (config.type === 'crossed-off') {
		return {
			type: 'crossed-off',
			...shared({...config, defaultStrokeWidth: 20}),
			iterations: resolveIterations(config.iterations, 1),
			rtl: config.rtl ?? false,
		};
	}

	if (config.type === 'circle') {
		return {
			type: 'circle',
			...shared({...config, defaultStrokeWidth: 20}),
			padding: resolvePadding(config.padding),
			iterations: resolveIterations(config.iterations, 2),
			box: config.box ?? 'around',
		};
	}

	if (config.type === 'highlight') {
		return {
			type: 'highlight',
			color: config.color ?? 'currentColor',
			padding: resolvePadding(config.padding),
			iterations: resolveIterations(config.iterations, 2),
			rtl: config.rtl ?? false,
		};
	}

	const invalidConfig = config as {readonly type: unknown};
	throw new TypeError(
		`Unsupported annotation type: ${String(invalidConfig.type)}`,
	);
};
