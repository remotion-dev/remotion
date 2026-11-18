import React from 'react';
import {Grid} from '../../components/TableOfContents/Grid';
import {TOCItem} from '../../components/TableOfContents/TOCItem';

export const TableOfContents: React.FC = () => {
	return (
		<div>
			<Grid>
				<TOCItem link="/docs/ai/coding-agents">
					<strong>{'Coding Agents'}</strong>
					<div>
						Use Claude Code, Codex, Kimi Code or OpenCode to prompt Remotion
						videos
					</div>
				</TOCItem>
				<TOCItem link="/docs/ai/skills">
					<strong>{'Agent Skills'}</strong>
					<div>Give coding agents current Remotion guidance</div>
				</TOCItem>
				<TOCItem link="/docs/ai/plugins">
					<strong>{'Plugins'}</strong>
					<div>Use Remotion with AI coding agents</div>
				</TOCItem>
				<TOCItem link="/docs/ai/webmcp">
					<strong>{'WebMCP'}</strong>
					<div>Control Remotion Studio with an AI agent</div>
				</TOCItem>
				<TOCItem link="/docs/ai/chatbot">
					<strong>{'Chatbot'}</strong>
					<div>Use the chatbot to get help with Remotion</div>
				</TOCItem>
				<TOCItem link="/templates/prompt-to-video">
					<strong>{'Prompt to Video'}</strong>
					<div>
						A template that turns prompts into short videos with a script,
						images and voiceover.
					</div>
				</TOCItem>
			</Grid>
		</div>
	);
};
