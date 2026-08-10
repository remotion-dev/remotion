import type {CSSProperties} from 'react';
import React from 'react';
import {Img} from 'remotion';
import {resolveCursor} from './resolve-cursor';

export type MacOSCursorProps = {
	readonly cursor: string;
	readonly scale?: number;
	readonly className?: string;
	readonly style?: CSSProperties;
};

export const MacOSCursor: React.FC<MacOSCursorProps> = ({
	cursor,
	scale = 1,
	className,
	style,
}) => {
	const resolved = resolveCursor(cursor);
	if (!resolved) {
		return null;
	}

	return (
		<Img
			className={className}
			src={resolved.src}
			style={{
				display: 'block',
				position: 'absolute',
				width: resolved.width ?? undefined,
				height: resolved.height ?? undefined,
				marginLeft: -resolved.hotspot.x,
				marginTop: -resolved.hotspot.y,
				transformOrigin: `${resolved.hotspot.x}px ${resolved.hotspot.y}px`,
				scale,
				...style,
			}}
		/>
	);
};
