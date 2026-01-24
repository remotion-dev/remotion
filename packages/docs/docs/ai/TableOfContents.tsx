import React from 'react';
import {Grid} from '../../components/TableOfContents/Grid';
import {TOCItem} from '../../components/TableOfContents/TOCItem';

export const TableOfContents: React.FC = () => {
	return (
		<div>
			<Grid>
				<TOCItem link="/docs/ai/chatbot">
					<strong>{'Chatbot'}</strong>
					<div>Use the chatbot to get help with Remotion</div>
				</TOCItem>
				<TOCItem link="/docs/ai/mcp">
					<strong>{'MCP'}</strong>
					<div>Get Remotion-domain specific help from LLMs</div>
				</TOCItem>
				<TOCItem link="/docs/ai/bolt">
					<strong>{'Bolt.new'}</strong>
					<div>Use Bolt.new to prompt Remotion videos</div>
				</TOCItem>
				<TOCItem link="/docs/ai/codebuddy">
					<strong>{'CodeBuddy'}</strong>
					<div>Use CodeBuddy to prompt Remotion videos</div>
				</TOCItem>
				<TOCItem link="/docs/ai/system-prompt">
					<strong>{'System Prompt'}</strong>
					<div>to teach LLMs Remotion rules</div>
				</TOCItem>
				<TOCItem link="/docs/ai/skills">
					<strong>{'Agent Skills'}</strong>
					<div>Skill files for Claude Code, Codex, etc.</div>
				</TOCItem>
				<TOCItem link="/templates/prompt-to-motion-graphics">
					<strong>{'Prompt to Motion Graphics template'}</strong>
					<div>A SaaS template for "Prompt to Motion Graphics" products.</div>
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
