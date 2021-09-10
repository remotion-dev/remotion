import React from 'react';

const caret: React.CSSProperties = {
	height: 12,
};

export const Caret = () => (
	<svg
		aria-hidden="true"
		focusable="false"
		data-prefix="fas"
		data-icon="caret-right"
		className="svg-inline--fa fa-caret-right fa-w-6"
		role="img"
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 192 512"
		style={caret}
	>
		<path
			fill="currentColor"
			d="M0 384.662V127.338c0-17.818 21.543-26.741 34.142-14.142l128.662 128.662c7.81 7.81 7.81 20.474 0 28.284L34.142 398.804C21.543 411.404 0 402.48 0 384.662z"
		/>
	</svg>
);
