/* eslint-disable react/no-array-index-key */
import type MediaFox from '@mediafox/core';
import type {Caption} from '@remotion/captions';
import {useEffect, useMemo, useRef, useState} from 'react';
import {useAudioPlayback} from '~/lib/use-audio-playback';
import {Card} from '../ui/card';
import {Switch} from '../ui/switch';

const SingleToken: React.FC<{
	readonly caption: Caption;
	readonly time: number;
	readonly lastActive: boolean;
}> = ({caption, time, lastActive}) => {
	const ref = useRef<HTMLDivElement>(null);
	useEffect(() => {
		if (ref.current && lastActive) {
			ref.current.scrollIntoView({behavior: 'smooth', block: 'center'});
		}
	}, [lastActive]);

	return (
		<div
			ref={ref}
			key={`${caption.text}-${caption.startMs}`}
			data-active={time * 1000 >= caption.startMs}
			className="border-b border-b-black py-2 border-l-4 border-l-transparent data-[active=true]:border-l-blue-500 data-[active=true]:font-bold"
		>
			<div className="px-3">
				<div className="text-xs font-brand font-medium">
					{(caption.startMs / 1000).toFixed(3)} -{' '}
					{(caption.endMs / 1000).toFixed(3)}
				</div>
				<p>{caption.text}</p>
			</div>
		</div>
	);
};

export default function Display({
	result: unfilteredResult,
	mediaFox,
}: {
	readonly result: Caption[];
	readonly mediaFox: MediaFox;
}) {
	const {time} = useAudioPlayback(mediaFox);
	const [tokens, setTokens] = useState<boolean>(false);

	const result = useMemo(() => {
		return unfilteredResult.map((c): Caption => {
			const isSystem = c.text.startsWith('[_') && c.text.endsWith(']');
			if (isSystem) {
				return {
					...c,
					text: ' ',
				};
			}

			return c;
		});
	}, [unfilteredResult]);

	const lastActiveIndex = useMemo(() => {
		// @ts-expect-error
		return result.findLastIndex((c) => time * 1000 >= c.startMs);
	}, [result, time]);

	if (result.length === 0) {
		return null;
	}

	return (
		<div>
			<div className="flex flex-row items-center">
				<div className="font-semibold tracking-tight text-ellipsis font-brand overflow-x-hidden text-xl">
					Show tokens
				</div>
				<div className="flex-1" />

				<Switch active={tokens} onToggle={() => setTokens((e) => !e)} />
			</div>
			<div className="h-4" />
			<Card className="max-h-[80vh] overflow-y-auto">
				<div data-tokens={tokens} className="data-[tokens=false]:p-4">
					{result.map((c, index) => {
						if (tokens) {
							if (c.text.trim() === '') {
								return null;
							}

							return (
								<SingleToken
									key={`${c.text}-${c.startMs}-${index}`}
									caption={c}
									time={time}
									lastActive={index === lastActiveIndex}
								/>
							);
						}

						return (
							<span
								key={`${c.text}-${c.startMs}-${index}`}
								data-active={time * 1000 >= c.startMs}
								data-last-active={index === lastActiveIndex}
								className="data-[active=true]:font-bold data-[last-active=true]:text-brand"
							>
								{c.text}
							</span>
						);
					})}
				</div>
			</Card>
		</div>
	);
}
