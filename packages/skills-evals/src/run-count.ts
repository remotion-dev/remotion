export const maxSkillEvalRunCount = 4;
export const maxParallelSkillEvalRuns = 8;

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
		runCount > maxSkillEvalRunCount
	) {
		throw new Error(
			`${name} must be an integer between 1 and ${maxSkillEvalRunCount}.`,
		);
	}

	return runCount;
};
