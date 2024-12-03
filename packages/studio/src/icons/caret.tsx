import React, {useMemo} from 'react';
import {LIGHT_TEXT} from '../helpers/colors';

const caret: React.CSSProperties = {
	height: 12,
};

const caretDown: React.CSSProperties = {
	width: 10,
};

const angleDown: React.CSSProperties = {
	width: 10,
};

export const CaretRight = () => (
	<svg viewBox="0 0 192 512" style={caret}>
		<path
			fill="currentColor"
			d="M0 384.662V127.338c0-17.818 21.543-26.741 34.142-14.142l128.662 128.662c7.81 7.81 7.81 20.474 0 28.284L34.142 398.804C21.543 411.404 0 402.48 0 384.662z"
		/>
	</svg>
);

export const CaretDown = () => {
	return (
		<svg viewBox="0 0 320 512" style={caretDown}>
			<path
				fill="currentColor"
				d="M31.3 192h257.3c17.8 0 26.7 21.5 14.1 34.1L174.1 354.8c-7.8 7.8-20.5 7.8-28.3 0L17.2 226.1C4.6 213.5 13.5 192 31.3 192z"
			/>
		</svg>
	);
};

export const AngleDown: React.FC<{
	readonly down: boolean;
}> = ({down}) => {
	const style = useMemo(() => {
		return {
			...angleDown,
			transform: down ? 'rotate(180deg)' : 'rotate(0deg)',
			marginTop: 1,
		};
	}, [down]);

	return (
		<svg style={style} viewBox="0 0 448 512">
			<path
				fill={LIGHT_TEXT}
				d="M201.4 342.6c12.5 12.5 32.8 12.5 45.3 0l160-160c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 274.7 86.6 137.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l160 160z"
			/>
		</svg>
	);
};
