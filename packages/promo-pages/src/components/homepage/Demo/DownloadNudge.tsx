import React from 'react';
import {FONTS} from '../layout/colors';

const origWidth = 77;
const scale = 0.4;

const Icon: React.FC = () => {
	return (
		<svg
			style={{
				width: origWidth * scale,
			}}
			viewBox="0 0 77 160"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="M5 154.5C51 121 79 81 69 5"
				stroke="currentColor"
				strokeWidth="8"
				strokeLinecap="round"
			/>
		</svg>
	);
};

export const DownloadNudge: React.FC = () => {
	return (
		<div
			style={{
				position: 'relative',
				flexDirection: 'row',
				display: 'flex',
				justifyContent: 'flex-end',
				textAlign: 'right',
				paddingRight: 22,
				paddingTop: 20,
			}}
		>
			<div>
				<Icon />
				<div
					style={{
						fontFamily: FONTS.GTPLANAR,
						fontSize: 15,
						width: 280,
						position: 'absolute',
						right: 70,
						top: 60,
					}}
				>
					Export the video using
					<br />{' '}
					<a href="/lambda" className="bluelink">
						Remotion Lambda
					</a>
					.
				</div>
			</div>
		</div>
	);
};
