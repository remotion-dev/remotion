/* eslint-disable react/no-array-index-key */
import type {Caption} from '@remotion/captions';
import {Button, Button as RemotionButton, Switch} from '@remotion/design';
import type {WhisperWebGpuTranscription} from '@remotion/whisper-webgpu';
import {Download} from 'lucide-react';
import {useEffect, useMemo, useRef, useState} from 'react';
import {ClipboardIcon} from '../icons/ClipboardIcon';
import {Card} from '../ui/card';

const downloadJson = (value: unknown, filename: string) => {
	const blob = new Blob([JSON.stringify(value, null, 2)], {
		type: 'application/json',
	});
	const a = document.createElement('a');
	a.href = URL.createObjectURL(blob);
	a.download = filename;
	a.click();
	URL.revokeObjectURL(a.href);
};

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
	time,
	whisperWebGpuOutput,
}: {
	readonly result: Caption[];
	readonly time: number;
	readonly whisperWebGpuOutput: WhisperWebGpuTranscription;
}) {
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

	return (
		<div>
			{result.length > 0 ? (
				<>
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
					<div className="h-4" />
				</>
			) : null}
			<RemotionButton
				className="block w-full"
				onClick={() => downloadJson(unfilteredResult, 'captions.json')}
			>
				Download as Caption[]
			</RemotionButton>
			<div className="h-2" />
			<div className="flex flex-row gap-2">
				<Button
					className="w-full flex-1 flex-row justify-start rounded-full text-sm h-10"
					type="button"
					onClick={() =>
						downloadJson(whisperWebGpuOutput, 'whisper-output.json')
					}
					depth={0.2}
				>
					<Download className="size-4" />
					<div className="w-2" />
					Whisper output
				</Button>
				<Button
					className="w-full flex-1 flex-row justify-start rounded-full text-sm h-10"
					type="button"
					onClick={() =>
						navigator.clipboard.writeText(whisperWebGpuOutput.text)
					}
					depth={0.2}
				>
					<ClipboardIcon />
					<div className="w-2" />
					Copy text
				</Button>
			</div>
		</div>
	);
}
