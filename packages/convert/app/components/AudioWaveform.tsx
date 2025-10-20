import type MediaFox from '@mediafox/core';
import React, {useMemo} from 'react';
import {useAudioPlayback} from '~/lib/use-audio-playback';
import {AMOUNT_OF_BARS} from '~/lib/waveform-visualizer';

export const AudioWaveForm: React.FC<{
	readonly bars: number[];
	readonly mediafox: MediaFox;
}> = ({bars, mediafox}) => {
	const padded = useMemo(() => {
		const p: (number | null)[] = [...bars];
		while (p.length < AMOUNT_OF_BARS) {
			p.push(null);
		}

		return p;
	}, [bars]);

	const {time, duration, playing} = useAudioPlayback(mediafox);
	const progress = time / duration;

	return (
		<>
			{padded.map((bar, i) => {
				const height = (bar ?? 0) * 40;

				return (
					<div
						// eslint-disable-next-line react/no-array-index-key
						key={i}
						data-notnull={bar !== null}
						data-playing={playing}
						data-show={progress > i / AMOUNT_OF_BARS}
						className="rounded bg-slate-200 inline-block w-[4px] data-[notnull=true]:bg-slate-600 opacity-50 data-[show=true]:opacity-100"
						style={{
							height: Math.max(6, height),
							transition:
								'height 0.2s ease, color 0.2s ease, opacity 0.2s ease',
						}}
					/>
				);
			})}
		</>
	);
};

export const AudioWaveformContainer: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	return (
		<div className="relative bg-slate-100 justify-center items-center flex flex-row gap-px h-[197px] group-fullscreen:flex-1">
			{children}
		</div>
	);
};
