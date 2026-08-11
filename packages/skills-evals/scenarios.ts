export type SkillEvalScenario = {
	id: string;
	model: string;
	prompt: string;
	timeoutMs?: number;
};

export const scenarios: SkillEvalScenario[] = [
	{
		id: 'vertical-promo-text-layout-proportions',
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
	{
		id: 'landscape-promo-text-layout-proportions',
		model: 'openai-codex/gpt-5.5',
		prompt: `Make a simple short landscape promo video for a new productivity app called FlowPilot.

It's an app that helps small teams plan projects, assign tasks, and see what needs attention next. The video should feel like a clean website hero animation or YouTube pre-roll.

Please include these phrases in the video:
- "Bring the whole team into focus"
- "Plan projects faster"
- "Assign tasks clearly"
- "See what needs attention"
- "Start with FlowPilot"

Use a few animated shapes, simple app-style cards, and smooth transitions. Keep it around 10 seconds long.`,
		timeoutMs: 20 * 60 * 1000,
	},
	{
		id: 'map-trip-la-ny-paris-3d',
		model: 'openai-codex/gpt-5.5',
		prompt: `Use Remotion best practices. Make a new composition with a map.

Start focused on Los Angeles, then zoom out while staying visually focused on LA. Once the zoom-out is done, animate a route line from LA to New York and make the camera follow the line as it travels.

Add another stop to the trip: Paris. Continue the route from New York to Paris, then animate the Eiffel Tower and show it in 3D.`,
		timeoutMs: 20 * 60 * 1000,
	},
	{
		id: 'bar-line-chart-revenue-conversion',
		model: 'openai-codex/gpt-5.5',
		prompt: `Create a 1920x1080 dark-themed (#1A1A2E) composition called 'BarLineChart' with a combination chart showing monthly sales data.

Use bars for revenue ($8K, $12K, $15K, $11K, $18K, $22K for Jan-Jun) that grow upward from the baseline. Overlay a blue (#0B84F3) line tracking conversion rate (2.1%, 2.8%, 3.2%, 2.9%, 3.8%, 4.2%) that draws progressively with a glowing effect.

Bars should animate sequentially with slight overlap while the line follows behind. Include axis labels and a pulsing dot marker at the line tip. Use smooth spring-based timing over 120 frames at 30fps. Use the remotion-best-practices skill.`,
		timeoutMs: 20 * 60 * 1000,
	},
	{
		id: 'youtube-subscribe-lower-third',
		model: 'openai-codex/gpt-5.5',
		prompt: `Use Remotion best practices. This is our YouTube channel: https://www.youtube.com/@remotion_dev.

Use curl to scrape YouTube and find the channel avatar and subscriber count. Multiple subscriber counts may appear on the page, so identify the correct one for the channel.

Make a white lower third that slides in from the bottom center. Show the channel name, subscriber count, and avatar. Display a typical fixed-width black YouTube subscribe button that changes from "Subscribe" to "Subscribed".

Use an ease-out animation for pressing in the button, then a spring animation with a slight bounce once the button is released. Fade out the lower third. Render it as a transparent ProRes video.`,
		timeoutMs: 20 * 60 * 1000,
	},
];
