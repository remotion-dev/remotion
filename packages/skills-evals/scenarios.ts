export type SkillEvalScenario = {
	id: string;
	model: string;
	prompt: string;
	timeoutMs?: number;
};

export const scenarios: SkillEvalScenario[] = [
	{
		id: 'vertical-promo-text-motion',
		model: 'openai-codex/gpt-5.5',
		prompt: `Make a simple short vertical promo video for a new productivity app called FlowPilot.

It's an app that helps people plan their week faster and automatically adjust their schedule when plans change. The video should feel like a clean product launch ad for Instagram or TikTok.

Please include these phrases in the video:
- "Plan your week in minutes"
- "AI-powered schedules that adapt when life changes"
- "Smart priorities"
- "Calendar sync"
- "Focus blocks"
- "Try FlowPilot today"

Use a few animated shapes, simple app-style cards, and smooth transitions. Keep it around 10 seconds long.`,
		timeoutMs: 20 * 60 * 1000,
	},
];
