import React from 'react';

const caret: React.CSSProperties = {
	height: 12,
};

const caretDown: React.CSSProperties = {
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
