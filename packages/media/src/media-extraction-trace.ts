const MAX_RECENT_STEPS = 20;

type ActiveStep = {
	id: number;
	label: string;
	startedAt: number;
};

type CompletedStep = {
	label: string;
	durationInMilliseconds: number;
};

export type MediaExtractionTrace = {
	completeStep: (id: number) => void;
	failStep: (id: number) => void;
	getSummary: () => string;
	startStep: (label: string) => number;
};

export const makeMediaExtractionTrace = ({
	src,
	timeInSeconds,
}: {
	src: string;
	timeInSeconds: number;
}): MediaExtractionTrace => {
	let nextId = 0;
	const activeSteps: ActiveStep[] = [];
	const completedSteps: CompletedStep[] = [];

	const removeActiveStep = (id: number) => {
		const index = activeSteps.findIndex((activeStep) => activeStep.id === id);
		if (index === -1) {
			return null;
		}

		const [removedStep] = activeSteps.splice(index, 1);
		return removedStep;
	};

	const addCompletedStep = (completedStep: CompletedStep) => {
		completedSteps.push(completedStep);
		if (completedSteps.length > MAX_RECENT_STEPS) {
			completedSteps.shift();
		}
	};

	return {
		startStep: (label: string) => {
			const id = nextId++;
			activeSteps.push({
				id,
				label,
				startedAt: Date.now(),
			});
			return id;
		},
		completeStep: (id: number) => {
			const step = removeActiveStep(id);
			if (!step) {
				return;
			}

			addCompletedStep({
				label: step.label,
				durationInMilliseconds: Date.now() - step.startedAt,
			});
		},
		failStep: (id: number) => {
			removeActiveStep(id);
		},
		getSummary: () => {
			const now = Date.now();
			const lines = [`Media extraction trace for ${src} at ${timeInSeconds}s:`];

			if (activeSteps.length === 0) {
				lines.push('No active media extraction step.');
			} else {
				lines.push('Active media extraction steps:');
				for (const step of activeSteps) {
					lines.push(`- ${step.label} running for ${now - step.startedAt}ms`);
				}
			}

			if (completedSteps.length > 0) {
				lines.push('Recent completed media extraction steps:');
				for (const step of completedSteps) {
					lines.push(
						`- ${step.label} completed in ${step.durationInMilliseconds}ms`,
					);
				}
			}

			return lines.join('\n');
		},
	};
};

export const traceMediaOperation = async <T>({
	trace,
	label,
	operation,
}: {
	trace: MediaExtractionTrace | null | undefined;
	label: string;
	operation: () => Promise<T> | T;
}): Promise<T> => {
	if (!trace) {
		return operation();
	}

	const stepId = trace.startStep(label);
	try {
		const result = await operation();
		trace.completeStep(stepId);
		return result;
	} catch (err) {
		trace.failStep(stepId);
		throw err;
	}
};

export const getMediaExtractionTimeoutInMilliseconds = () => {
	const timeout =
		typeof window === 'undefined'
			? 30_000
			: (window.remotion_puppeteerTimeout ?? 30_000);

	return Math.max(3_000, timeout - 5_000);
};

export const withMediaExtractionTimeout = <T>({
	promise,
	trace,
	src,
	timeInSeconds,
	timeoutInMilliseconds,
	onTimeout,
}: {
	promise: Promise<T>;
	trace: MediaExtractionTrace | null | undefined;
	src: string;
	timeInSeconds: number;
	timeoutInMilliseconds: number;
	onTimeout?: () => void;
}): Promise<T> => {
	let timeoutId: ReturnType<typeof setTimeout> | null = null;

	const clear = () => {
		if (timeoutId) {
			clearTimeout(timeoutId);
			timeoutId = null;
		}
	};

	return Promise.race([
		promise.finally(clear),
		new Promise<never>((_, reject) => {
			timeoutId = setTimeout(() => {
				let timeoutHookError: unknown = null;
				try {
					onTimeout?.();
				} catch (err) {
					timeoutHookError = err;
				}

				const lines = [
					`Timed out extracting media from ${src} at ${timeInSeconds}s after ${timeoutInMilliseconds}ms.`,
					trace ? trace.getSummary() : null,
					timeoutHookError
						? `The media extraction timeout cleanup failed: ${
								timeoutHookError instanceof Error
									? (timeoutHookError.stack ?? timeoutHookError.message)
									: String(timeoutHookError)
							}`
						: null,
				].filter(Boolean);

				reject(new Error(lines.join('\n\n')));
			}, timeoutInMilliseconds);
		}),
	]);
};
