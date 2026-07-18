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
				<TOCItem link="/docs/ai/claude-code-plugin">
					<strong>{'Claude Code plugin'}</strong>
					<div>Use the Remotion plugin in Claude Code</div>
				</TOCItem>
				<TOCItem link="/docs/ai/codex-plugin">
					<strong>{'Codex plugin'}</strong>
					<div>Use the Remotion plugin in the ChatGPT Codex app</div>
				</TOCItem>
				<TOCItem link="/docs/ai/kimi-code-plugin">
					<strong>{'Kimi Code plugin'}</strong>
					<div>Use the Remotion plugin in Kimi Code</div>
				</TOCItem>
				<TOCItem link="/docs/ai/chatbot">
					<strong>{'Chatbot'}</strong>
					<div>Use the chatbot to get help with Remotion</div>
				</TOCItem>
				<TOCItem link="/docs/ai/bolt">
					<strong>{'Bolt.new'}</strong>
					<div>Use Bolt.new to prompt Remotion videos</div>
				</TOCItem>
				<TOCItem link="/docs/ai/system-prompt">
					<strong>{'System Prompt'}</strong>
					<div>to teach LLMs Remotion rules</div>
				</TOCItem>
				<TOCItem link="/docs/ai/generate">
					<strong>{'Code generation with LLMs'}</strong>
					<div>Generate Remotion code by invoking AI</div>
				</TOCItem>
				<TOCItem link="/docs/ai/dynamic-compilation">
					<strong>{'Just-in-time compilation'}</strong>
					<div>Compile a Remotion component in JavaScript</div>
				</TOCItem>
				<TOCItem link="/docs/ai/ai-saas-template">
					<strong>{'AI SaaS Template'}</strong>
					<div>
						An AI SaaS template for "Prompt to Motion Graphics" products.
					</div>
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
