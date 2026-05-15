export const maxParallelSkillEvalRuns = 4;

export const validateSkillEvalRunCount = (
	runCount: number | undefined,
	name = 'Run count',
) => {
	if (runCount === undefined) {
		return 1;
	}

	if (
		!Number.isInteger(runCount) ||
		runCount < 1 ||
		runCount > maxParallelSkillEvalRuns
	) {
		throw new Error(
			`${name} must be an integer between 1 and ${maxParallelSkillEvalRuns}.`,
		);
	}

	return runCount;
};
