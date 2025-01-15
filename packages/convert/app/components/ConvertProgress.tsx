import type {
	ConvertMediaContainer,
	ConvertMediaProgress,
} from '@remotion/webcodecs';
import React, {createRef} from 'react';
import {formatBytes} from '~/lib/format-bytes';
import {formatSeconds} from '~/lib/format-seconds';
import {getNewName} from '~/lib/generate-new-name';
import {
	useAddOutputFilenameToTitle,
	useAddProgressToTitle,
} from '~/lib/title-context';
import {AudioWaveForm} from './AudioWaveform';
import {Card} from './ui/card';
import {Skeleton} from './ui/skeleton';
import type {VideoThumbnailRef} from './VideoThumbnail';
import {VideoThumbnail} from './VideoThumbnail';

export const convertProgressRef = createRef<VideoThumbnailRef>();

export const ConvertProgress: React.FC<{
	readonly state: ConvertMediaProgress;
	readonly name: string | null;
	readonly container: ConvertMediaContainer;
	readonly done: boolean;
	readonly duration: number | null;
	readonly isReencoding: boolean;
	readonly isAudioOnly: boolean;
	readonly bars: number[];
}> = ({
	state,
	name,
	bars,
	container,
	done,
	isReencoding,
	duration,
	isAudioOnly,
}) => {
	const progress = done
		? 1
		: duration === null
			? null
			: state.millisecondsWritten / 1000 / duration;

	useAddProgressToTitle(progress);
	const newName = name ? getNewName(name, container) : null;

	useAddOutputFilenameToTitle(newName);

	return (
		<Card className="overflow-hidden">
			{isReencoding && !isAudioOnly ? (
				<>
					<VideoThumbnail
						ref={convertProgressRef}
						initialReveal
						smallThumbOnMobile={false}
						rotation={0}
						mirrorHorizontal={false}
						mirrorVertical={false}
					/>
					{duration ? (
						<>
							<div className="h-5 overflow-hidden">
								{state.millisecondsWritten || done ? (
									<div
										className="w-[50%] h-5 bg-brand"
										style={{
											width: (progress ?? 0) * 100 + '%',
										}}
									/>
								) : null}
							</div>
							<div className="border-b-2 border-black" />
						</>
					) : null}
				</>
			) : duration ? (
				<AudioWaveForm bars={bars} />
			) : null}
			<div className="p-2">
				<div>
					{name ? (
						<strong className="font-brand ">{newName}</strong>
					) : (
						<Skeleton className="h-4 w-[200px]" />
					)}
				</div>
				<div className="tabular-nums text-muted-foreground font-brand text-sm">
					<span>{formatSeconds(state.millisecondsWritten / 1000)}</span>
					{' • '}
					<span>{formatBytes(state.bytesWritten)}</span>
				</div>
			</div>
		</Card>
	);
};
