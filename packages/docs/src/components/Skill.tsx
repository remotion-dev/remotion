import Link from '@docusaurus/Link';
import React from 'react';

export const Skill: React.FC<{readonly children: string}> = ({children}) => {
	return (
		<Link
			to={`/docs/ai/skills#${children.replace(/^.*[/:]/, '')}`}
			style={{
				marginLeft: '0.25em',
				whiteSpace: 'nowrap',
			}}
		>
			<code>
				<svg
					aria-hidden="true"
					focusable="false"
					viewBox="0 0 22 28"
					fill="none"
					stroke="currentColor"
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth={1.8}
					style={{
						width: '0.8em',
						height: '1em',
						marginRight: '0.15em',
						verticalAlign: 'middle',
					}}
				>
					<path d="M11 1.5 20.25 7v14L11 26.5 1.75 21V7Z" />
					<path d="M1.75 7 11 12.5 20.25 7M11 12.5v14M1.75 14 11 19.5 20.25 14" />
				</svg>
				{children}
			</code>
		</Link>
	);
};
