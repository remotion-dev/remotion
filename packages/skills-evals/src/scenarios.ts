export type SkillEvalScenario = {
	id: string;
	model: string;
	prompt: string;
	timeoutMs?: number;
};

export const scenarios: SkillEvalScenario[] = [
	{
		id: 'animated-bar-chart',
		model: 'openai-codex/gpt-5.5',
		timeoutMs: 20 * 60 * 1000,
		prompt: `Create a polished Remotion video in this blank project.

The video should be an animated bar chart comparing four fictional product metrics. Make it visually refined: clear typography, smooth timing, nice spacing, and a short title.

Use the Remotion skill guidance available in this project. When you are done, render a visual artifact that can be reviewed, preferably an MP4 video.`,
	},
];
