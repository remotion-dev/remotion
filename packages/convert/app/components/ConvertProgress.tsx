import React, {createRef} from 'react';
import {formatBytes} from '~/lib/format-bytes';
import {formatElapsedTime} from '~/lib/format-elapsed-time';
import {formatSeconds} from '~/lib/format-seconds';
import type {ConvertProgressType} from '~/lib/progress';
import {
	useAddOutputFilenameToTitle,
	useAddProgressToTitle,
} from '~/lib/title-context';
import {AudioWaveForm, AudioWaveformContainer} from './AudioWaveform';
import {Card} from './ui/card';
import {Skeleton} from './ui/skeleton';
import type {VideoThumbnailRef} from './VideoThumbnail';
import {VideoThumbnail} from './VideoThumbnail';

export const convertProgressRef = createRef<VideoThumbnailRef>();

export const ConvertProgress: React.FC<{
	readonly state: ConvertProgressType;
	readonly newName: string | null;
	readonly done: boolean;
	readonly duration: number | null;
	readonly isReencoding: boolean;
	readonly isAudioOnly: boolean;
	readonly bars: number[];
	readonly startTime?: number;
	readonly completedTime?: number;
}> = ({
	state,
	newName,
	bars,
	done,
	isReencoding,
	duration,
	isAudioOnly,
	startTime,
	completedTime,
}) => {
	const progress = done ? 1 : state.overallProgress;

	useAddProgressToTitle(progress);
	useAddOutputFilenameToTitle(newName);

	return (
		<Card className="overflow-hidden">
			{isReencoding && !isAudioOnly ? (
				<>
					<VideoThumbnail
						ref={convertProgressRef}
						trackRotation={null}
						initialReveal
						smallThumbOnMobile={false}
						userRotation={0}
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
			) : duration && isAudioOnly ? (
				<AudioWaveformContainer>
					<AudioWaveForm bars={bars} />
				</AudioWaveformContainer>
			) : null}
			<div className="p-2">
				<div>
					{newName ? (
						<strong className="font-brand ">{newName}</strong>
					) : (
						<Skeleton className="h-4 w-[200px]" />
					)}
				</div>
				<div className="tabular-nums text-muted-foreground font-brand text-sm">
					<span>{formatSeconds(state.millisecondsWritten / 1000)}</span>
					{' • '}
					<span>{formatBytes(state.bytesWritten)}</span>
					{startTime && (
						<>
							{' • '}
							<span>
								Time:{' '}
								{formatElapsedTime(
									done && completedTime
										? completedTime - startTime
										: Date.now() - startTime,
								)}
							</span>
						</>
					)}
				</div>
			</div>
		</Card>
	);
};
