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
				cursor: 'pointer',
			}}
		/>
	);
};
