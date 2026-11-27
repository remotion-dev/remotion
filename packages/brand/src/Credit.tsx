import type {CSSProperties} from 'react';
import {Interactive} from 'remotion';

const CreditContent = ({
	children,
	href,
	style,
}: {
	readonly children: string;
	readonly href: string | null;
	readonly style: CSSProperties | null;
}) => {
	return (
		<a
			href={href || undefined}
			target="_blank"
			rel="noreferrer"
			style={{
				position: 'absolute',
				left: 32,
				top: 32,
				fontWeight: 500,
				fontSize: 30,
				lineHeight: 1.2,
				padding: '0.21875em 0.625em',
				backgroundColor: '#ffffff',
				color: '#000000',
				whiteSpace: 'nowrap',
				textDecoration: 'none',
				...style,
			}}
		>
			{children}
		</a>
	);
};

export const Credit = Interactive.create({
	Component: CreditContent,
	layout: 'none',
	schema: {
		...Interactive.childrenSchema,
		...Interactive.textSchema,
		...Interactive.backgroundSchema,
		href: {type: 'string', default: '', description: 'Source URL'},
	},
});
