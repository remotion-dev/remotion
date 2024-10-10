import React, {useCallback} from 'react';

export const Switcher: React.FC<{
	type: 'left' | 'right';
	theme: 'dark' | 'light';
	onTap: () => void;
}> = ({type, theme, onTap}) => {
	const onPointerDown = useCallback(
		(e: React.PointerEvent<HTMLDivElement>) => {
			e.stopPropagation();
			onTap();
		},
		[onTap],
	);

	return (
		<div
			onPointerDown={onPointerDown}
			style={{
				height: 30,
				width: 30,
				borderRadius: 15,
				position: 'absolute',
				marginLeft: -15,
				top: '50%',
				left: type === 'left' ? 0 : '100%',
				marginTop: -15,
				backgroundColor: theme === 'dark' ? '#222' : 'white',
				color: theme === 'dark' ? 'white' : 'black',
				cursor: 'pointer',
				justifyContent: 'center',
				alignItems: 'center',
				display: 'flex',
			}}
		>
			<svg style={{height: 16}} viewBox="0 0 320 512">
				{type === 'left' ? (
					<path
						fill="currentcolor"
						d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l192 192c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256 246.6 86.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-192 192z"
					/>
				) : null}
				{type === 'right' ? (
					<path
						fill="currentcolor"
						d="M310.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-192 192c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L242.7 256 73.4 86.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l192 192z"
					/>
				) : null}
			</svg>
		</div>
	);
};
