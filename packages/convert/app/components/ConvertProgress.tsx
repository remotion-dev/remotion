import React, {
	createRef,
	useCallback,
	useEffect,
	useRef,
	useState,
} from 'react';
import {formatBytes} from '~/lib/format-bytes';
import {formatElapsedTime} from '~/lib/format-elapsed-time';
import {formatSeconds} from '~/lib/format-seconds';
import type {ConvertProgressType} from '~/lib/progress';
import {
	useAddOutputFilenameToTitle,
	useAddProgressToTitle,
} from '~/lib/title-context';
import {AudioWaveForm, AudioWaveformContainer} from './AudioWaveform';
import {PenIcon} from './icons/pen';
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
	readonly bars: number[];
	readonly startTime?: number;
	readonly completedTime?: number;
	readonly draggableFile: File | null;
	readonly onNameChange: ((name: string) => void) | null;
}> = ({
	state,
	newName,
	bars,
	done,
	isReencoding,
	duration,
	startTime,
	completedTime,
	draggableFile,
	onNameChange,
}) => {
	const progress = done ? 1 : state.overallProgress;
	const [isRenaming, setIsRenaming] = useState(false);
	const [draftName, setDraftName] = useState(newName ?? '');
	const nameInputRef = useRef<HTMLInputElement>(null);

	useAddProgressToTitle(progress);
	useAddOutputFilenameToTitle(newName);

	useEffect(() => {
		if (!isRenaming) {
			setDraftName(newName ?? '');
		}
	}, [isRenaming, newName]);

	useEffect(() => {
		if (isRenaming) {
			nameInputRef.current?.focus();
			nameInputRef.current?.select();
		}
	}, [isRenaming]);

	const commitName = useCallback(() => {
		if (!newName || !onNameChange) {
			setIsRenaming(false);
			return;
		}

		const trimmedName = draftName.trim();
		if (trimmedName) {
			onNameChange(trimmedName);
		} else {
			setDraftName(newName);
		}

		setIsRenaming(false);
	}, [draftName, newName, onNameChange]);

	const cancelRenaming = useCallback(() => {
		setDraftName(newName ?? '');
		setIsRenaming(false);
	}, [newName]);

	return (
		<Card className="overflow-hidden">
			{isReencoding && state.hasVideo ? (
				<>
					<VideoThumbnail
						ref={convertProgressRef}
						trackRotation={null}
						initialReveal
						smallThumbOnMobile={false}
						userRotation={0}
						mirrorHorizontal={false}
						mirrorVertical={false}
						draggableFile={done ? draggableFile : null}
						draggableFileName={done ? newName : null}
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
			) : duration && !state.hasVideo ? (
				<>
					<AudioWaveformContainer>
						<AudioWaveForm bars={bars} progress={progress} />
					</AudioWaveformContainer>
					<div className="border-b-2 border-black" />
				</>
			) : null}
			<div className="group/output-details p-2">
				<div>
					{newName && isRenaming ? (
						<input
							ref={nameInputRef}
							aria-label="File name"
							className="h-6 w-full rounded-sm border border-input bg-background px-1 font-brand font-bold focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
							value={draftName}
							onChange={(event) => setDraftName(event.target.value)}
							onBlur={commitName}
							onKeyDown={(event) => {
								if (event.key === 'Enter') {
									event.preventDefault();
									commitName();
								}

								if (event.key === 'Escape') {
									event.preventDefault();
									cancelRenaming();
								}
							}}
						/>
					) : newName ? (
						<div className="flex min-w-0 items-center">
							<strong className="min-w-0 break-all font-brand">
								{newName}
							</strong>
							{done && onNameChange ? (
								<button
									type="button"
									aria-label="Rename file"
									title="Rename file"
									className="pointer-events-none ml-1 inline-flex size-6 shrink-0 items-center justify-center rounded-sm opacity-0 transition-opacity group-hover/output-details:pointer-events-auto group-hover/output-details:opacity-100 focus-visible:opacity-100 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
									onClick={() => setIsRenaming(true)}
								>
									<PenIcon
										aria-hidden="true"
										color="#000000"
										className="size-[18px]"
									/>
								</button>
							) : null}
						</div>
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
