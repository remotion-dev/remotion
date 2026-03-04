export type ExitBehavior = 'process-exit' | 'throw';

export const failOrThrow = ({
	behavior,
	code,
	error,
}: {
	behavior: ExitBehavior;
	code: number;
	error: Error;
}): never => {
	if (behavior === 'throw') {
		throw error;
	}

	process.exit(code);
};
