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
				<TOCItem link="/docs/ai/system-prompt">
					<strong>{'System Prompt'}</strong>
					<div>to teach LLMs Remotion rules</div>
				</TOCItem>
			</Grid>
		</div>
	);
};
