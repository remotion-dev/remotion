import React from 'react';
import {FONTS} from '../layout/colors';
import {useColorMode} from '../layout/use-color-mode';

const origWidth = 37;
const scale = 0.4;

export const Icon: React.FC = () => {
	return (
		<svg
			style={{
				width: origWidth * scale,
				overflow: 'visible',
			}}
			viewBox="0 0 37 59"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="M32 5C32 36.5 21 44 5 54"
				stroke="currentColor"
				strokeWidth="8"
				strokeLinecap="round"
			/>
		</svg>
	);
};

export const ThemeNudge: React.FC = () => {
	const {colorMode, setColorMode} = useColorMode();

	const toggleTheme: React.MouseEventHandler = React.useCallback(
		(e) => {
			e.preventDefault();
			setColorMode(colorMode === 'dark' ? 'light' : 'dark');
		},
		[colorMode, setColorMode],
	);

	return (
		<div
			style={{
				flexDirection: 'row',
				display: 'flex',
				justifyContent: 'flex-start',
				paddingBottom: 0,
				textAlign: 'right',
				position: 'absolute',
			}}
			className="lg:top-3 lg:-right-6 right-0 top-0"
		>
			<div>
				<div
					style={{
						fontFamily: FONTS.GTPLANAR,
						fontSize: 15,
						width: 280,
						paddingBottom: 8,
						marginLeft: 20,
						textWrap: 'balance',
						marginTop: 5,
					}}
				>
					<a href="#" onClick={toggleTheme} className="bluelink">
						Switch to {colorMode === 'dark' ? 'light' : 'dark'} mode
					</a>{' '}
					and see the video adjust!{' '}
				</div>
				<Icon />
			</div>
		</div>
	);
};
