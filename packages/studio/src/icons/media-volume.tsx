const size = 21;

const speakerPath =
	'M112 320H48c-8.8 0-16-7.2-16-16v-96c0-8.8 7.2-16 16-16h64c8.5 0 16.6-3.4 22.6-9.4L252.7 64.6c.4-.4.9-.6 1.4-.6 1.1 0 1.9.9 1.9 1.9V446c0 1.1-.9 1.9-1.9 1.9-.5 0-1-.2-1.4-.6L134.6 329.4c-6-6-14.1-9.4-22.6-9.4zm0-160H48c-26.5 0-48 21.5-48 48v96c0 26.5 21.5 48 48 48h64l118.1 118.1c6.4 6.4 15 9.9 24 9.9 18.7 0 33.9-15.2 33.9-33.9V65.9C288 47.2 272.8 32 254.1 32c-9 0-17.6 3.6-24 9.9L112 160zm243.2 22.4c-5.3 7.1-3.9 17.1 3.2 22.4 15.6 11.7 25.6 30.3 25.6 51.2s-10 39.5-25.6 51.2c-7.1 5.3-8.5 15.3-3.2 22.4s15.3 8.5 22.4 3.2C400.9 315.3 416 287.4 416 256s-15.1-59.3-38.4-76.8c-7.1-5.3-17.1-3.9-22.4 3.2zm87-74.5c-6.8-5.6-16.9-4.7-22.5 2.1s-4.7 16.9 2.1 22.5C457.4 161.9 480 206.3 480 256s-22.6 94.1-58.2 123.4c-6.8 5.6-7.8 15.7-2.1 22.5s15.7 7.8 22.5 2.2C484.8 368.9 512 315.6 512 256s-27.2-112.9-69.8-148.1z';

export const VolumeOffIcon: React.FC<{readonly color: string}> = ({color}) => {
	return (
		<svg width={size} height={size} viewBox="0 0 576 512">
			<g transform="translate(32 0)">
				<path d={speakerPath} fill={color} />
			</g>
			<path
				d="M16-16 560 528"
				fill="none"
				stroke={color}
				strokeLinecap="round"
				strokeWidth="32"
			/>
		</svg>
	);
};

export const VolumeOnIcon: React.FC<{readonly color: string}> = ({color}) => {
	return (
		<svg width={size} height={size} viewBox="0 0 576 512">
			<g transform="translate(32 0)">
				<path d={speakerPath} fill={color} />
			</g>
		</svg>
	);
};
