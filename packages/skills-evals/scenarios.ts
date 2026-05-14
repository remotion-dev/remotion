export type SkillEvalScenario = {
	id: string;
	model: string;
	prompt: string;
	timeoutMs?: number;
};

export const scenarios: SkillEvalScenario[] = [];
