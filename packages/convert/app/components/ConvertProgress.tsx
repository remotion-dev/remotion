import {ConvertMediaContainer, ConvertMediaProgress} from '@remotion/webcodecs';
import React, {createRef} from 'react';
import {formatBytes} from '~/lib/format-bytes';
import {formatSeconds} from '~/lib/format-seconds';
import {getNewName} from '~/lib/generate-new-name';
import {Card} from './ui/card';
import {Skeleton} from './ui/skeleton';
import {VideoThumbnail, VideoThumbnailRef} from './VideoThumbnail';

export const convertProgressRef = createRef<VideoThumbnailRef>();

export const ConvertProgress: React.FC<{
	readonly state: ConvertMediaProgress;
	readonly name: string | null;
	readonly container: ConvertMediaContainer;
	readonly done: boolean;
	readonly duration: number | null;
}> = ({state, name, container, done, duration}) => {
	return (
		<>
			<Card className="overflow-hidden">
				<VideoThumbnail ref={convertProgressRef} smallThumbOnMobile={false} />
				<div className="border-b-2 border-black" />
				<div className="h-5 overflow-hidden">
					{state.millisecondsWritten || done ? (
						<div
							className="w-[50%] h-5 bg-brand"
							style={{
								width:
									(done
										? 1
										: duration === null
											? 0
											: state.millisecondsWritten / 1000 / duration) *
										100 +
									'%',
							}}
						/>
					) : null}
				</div>
				<div className="border-b-2 border-black" />
				<div className="p-2">
					<div>
						{name ? (
							<strong className="font-brand ">
								{getNewName(name, container)}
							</strong>
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
		</>
	);
};
