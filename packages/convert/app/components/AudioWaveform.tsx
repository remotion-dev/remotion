import React, {useMemo} from 'react';
import {AMOUNT_OF_BARS} from '~/lib/waveform-visualizer';
import {THUMBNAIL_HEIGHT} from './VideoThumbnail';

export const AudioWaveForm: React.FC<{readonly bars: number[]}> = ({bars}) => {
	const padded = useMemo(() => {
		const p: (number | null)[] = [...bars];
		while (p.length < AMOUNT_OF_BARS) {
			p.push(null);
		}

		return p;
	}, [bars]);

	return (
		<div
			style={{
				height: THUMBNAIL_HEIGHT,
			}}
			className="bg-slate-100 border-b-2 border-black justify-center items-center flex flex-row gap-[1px]"
		>
			{padded.map((bar, i) => {
				const height = ((bar ?? 0) / 255) * 40;

				return (
					<div
						// eslint-disable-next-line react/no-array-index-key
						key={i}
						data-notnull={bar !== null}
						className="rounded bg-slate-200 inline-block w-[4px] data-[notnull=true]:bg-slate-600"
						style={{
							height: Math.max(6, height),
							transition: 'height 0.2s ease, color 0.2s ease',
						}}
					/>
				);
			})}
		</div>
	);
};
