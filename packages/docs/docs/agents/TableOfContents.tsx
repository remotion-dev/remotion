import React from 'react';
import {Grid} from '../../components/TableOfContents/Grid';
import {TOCItem} from '../../components/TableOfContents/TOCItem';

export const TableOfContents: React.FC = () => {
	return (
		<div>
			<Grid>
				<TOCItem link="/docs/agents/skills">
					<strong>{'Agent Skills'}</strong>
					<div>Give coding agents current Remotion guidance</div>
				</TOCItem>
				<TOCItem link="/docs/agents/plugins">
					<strong>{'Plugins'}</strong>
					<div>Use Remotion with AI coding agents</div>
				</TOCItem>
				<TOCItem link="/docs/agents/webmcp">
					<strong>{'WebMCP'}</strong>
					<div>Control Remotion Studio with an AI agent</div>
				</TOCItem>
				<TOCItem link="/docs/ai/chatbot">
					<strong>{'Chatbot'}</strong>
					<div>Use the chatbot to get help with Remotion</div>
				</TOCItem>
			</Grid>
		</div>
	);
};
