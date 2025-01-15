import React, {useMemo} from 'react';
import {AMOUNT_OF_BARS} from '~/lib/waveform-visualizer';

export const AudioWaveForm: React.FC<{readonly bars: number[]}> = ({bars}) => {
	const padded = useMemo(() => {
		const p = [...bars];
		while (p.length < AMOUNT_OF_BARS) {
			p.push(0);
		}

		return p;
	}, [bars]);

	return (
		<div className="h-[70px] bg-slate-100 border-b-2 border-black justify-center items-center flex flex-row gap-[1px]">
			{padded.map((bar, i) => {
				return (
					<div
						// eslint-disable-next-line react/no-array-index-key
						key={i}
						className="rounded bg-slate-400 inline-block w-[4px]"
						style={{
							height: (bar / 255) * 40,
							transition: 'height 0.1s ease',
						}}
					/>
				);
			})}
		</div>
	);
};
