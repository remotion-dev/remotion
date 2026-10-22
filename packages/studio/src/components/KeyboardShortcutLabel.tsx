import React from 'react';
import {ShiftIcon} from '../icons/keys';

const shortcutLabel: React.CSSProperties = {
	alignItems: 'baseline',
	display: 'inline-flex',
	font: 'inherit',
	whiteSpace: 'nowrap',
};

export const KeyboardShortcutLabel: React.FC<{
	readonly shortcut: string;
	readonly style: React.CSSProperties | null;
}> = ({shortcut, style}) => {
	const visualShortcut = shortcut.replaceAll('⌘+', '⌘');
	const parts: React.ReactNode[] = [];
	let previousEnd = 0;
	for (const match of visualShortcut.matchAll(/\bShift(\+)?/g)) {
		const matchStart = match.index;
		parts.push(visualShortcut.slice(previousEnd, matchStart));
		parts.push(
			<span
				key={`shift-${matchStart}`}
				style={{
					alignItems: 'baseline',
					display: 'inline-flex',
					marginRight: match[1] ? 1 : 0,
				}}
			>
				<ShiftIcon color={style?.color ?? null} />
			</span>,
		);
		previousEnd = matchStart + match[0].length;
	}

	parts.push(visualShortcut.slice(previousEnd));

	return (
		<span aria-label={shortcut} style={{...shortcutLabel, ...style}}>
			{parts}
		</span>
	);
};
