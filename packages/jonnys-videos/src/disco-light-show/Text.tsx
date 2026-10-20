import type React from 'react';
import {Interactive} from 'remotion';

const TextInner = ({
	children,
	style,
}: {
	readonly children: React.ReactNode;
	readonly style: React.CSSProperties;
}) => <div style={style}>{children}</div>;

export const Text = Interactive.create({
	Component: TextInner,
	layout: 'none',
	schema: {
		...Interactive.textSchema,
		...Interactive.childrenSchema,
	},
});
