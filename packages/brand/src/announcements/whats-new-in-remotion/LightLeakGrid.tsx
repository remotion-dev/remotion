import {LightLeak} from '@remotion/light-leaks';
import {AbsoluteFill, Series} from 'remotion';

const SLOTS: {
	hueShift: number;
	seeds: [number, number, number];
	style: React.CSSProperties;
}[] = [
	{
		hueShift: 0,
		seeds: [1, 3, 5],
		style: {width: '50%', height: '50%', top: 0, left: 0},
	},
	{
		hueShift: 200,
		seeds: [7, 9, 11],
		style: {width: '50%', height: '50%', top: 0, left: '50%'},
	},
	{
		hueShift: 120,
		seeds: [13, 15, 17],
		style: {width: '50%', height: '50%', top: '50%', left: 0},
	},
	{
		hueShift: 300,
		seeds: [21, 23, 25],
		style: {width: '50%', height: '50%', top: '50%', left: '50%'},
	},
];

export const LightLeakGrid: React.FC<{durationInFrames: number}> = ({
	durationInFrames,
}) => {
	const variationDuration = Math.ceil(durationInFrames / 3);

	return (
		<AbsoluteFill style={{backgroundColor: 'black'}}>
			{SLOTS.map((slot) => (
				<AbsoluteFill key={slot.hueShift} style={slot.style}>
					<Series>
						{slot.seeds.map((seed) => (
							<Series.Sequence key={seed} durationInFrames={variationDuration}>
								<LightLeak seed={seed} hueShift={slot.hueShift} />
							</Series.Sequence>
						))}
					</Series>
				</AbsoluteFill>
			))}
		</AbsoluteFill>
	);
};
