import CodeBlock from '@theme/CodeBlock';
import React from 'react';
import {SYSTEM_PROMPT} from '../src/helpers/system-prompt';

export const SystemPrompt: React.FC = () => {
	return (
		<CodeBlock
			className="shiki github-dark"
			language="bash"
			style={{
				backgroundColor: 'rgb(13, 17, 23)',
				color: 'rgb(201, 209, 217)',
			}}
		>
			<div className="code-container">
				{SYSTEM_PROMPT.split('\n').map((line, i) => (
					// eslint-disable-next-line react/no-array-index-key
					<div key={i} className="line">
						{line}
					</div>
				))}
			</div>
		</CodeBlock>
	);
};
