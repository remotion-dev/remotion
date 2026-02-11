import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {PromptsShowPage} from './components/prompts/PromptsShow';
import type {PromptSubmission} from './components/prompts/prompt-types';
import './index.css';

const mockPromptSubmission: PromptSubmission = {
	id: 'mock-id',
	slug: 'mock-prompt',
	title: 'Mock Prompt',
	prompt: 'Create a video with a bouncing ball',
	muxPlaybackId: 'mock-playback-id',
	likeCount: 42,
	createdAt: new Date().toISOString(),
	githubUsername: 'remotion-dev',
	xUsername: null,
	customAvatarUrl: null,
	toolUsed: 'Claude Code',
	modelUsed: 'claude-sonnet-4-20250514',
};

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<div data-theme="light">
			<PromptsShowPage promptSubmission={mockPromptSubmission} />
		</div>
	</StrictMode>,
);
