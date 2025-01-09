import React, {useCallback} from 'react';

export const Switcher: React.FC<{
	readonly type: 'left' | 'right';
	readonly theme: 'dark' | 'light';
	readonly onTap: () => void;
}> = ({type, theme, onTap}) => {
	const onPointerDown = useCallback(
		(e: React.PointerEvent<HTMLDivElement>) => {
			e.stopPropagation();
			onTap();
		},
		[onTap],
	);

	const switcherSize = 40;

	return (
		<div
			onPointerDown={onPointerDown}
			style={{
				height: switcherSize,
				width: switcherSize,
				borderRadius: switcherSize / 2,
				position: 'absolute',
				marginLeft: -switcherSize / 2,
				top: '50%',
				left: type === 'left' ? 0 : '100%',
				marginTop: -switcherSize / 2,
				backgroundColor: theme === 'dark' ? '#222' : '#fafafa',
				color: theme === 'dark' ? 'white' : '#222',
				cursor: 'pointer',
				justifyContent: 'center',
				alignItems: 'center',
				display: 'flex',
			}}
		>
			<svg style={{height: switcherSize / 2}} viewBox="0 0 320 512">
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
