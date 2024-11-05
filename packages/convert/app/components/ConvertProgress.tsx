import {ConvertMediaState} from '@remotion/webcodecs';
import React from 'react';
import {formatBytes} from '~/lib/format-bytes';
import {formatSeconds} from '~/lib/format-seconds';
import {Card} from './ui/card';
import {Skeleton} from './ui/skeleton';

export const ConvertProgress: React.FC<{
	readonly state: ConvertMediaState;
	readonly name: string | null;
}> = ({state, name}) => {
	return (
		<>
			<Card className="overflow-hidden">
				<div className="h-5 overflow-hidden">
					{state.overallProgress ? (
						<div
							className="w-[50%] h-5 bg-brand"
							style={{width: state.overallProgress * 100 + '%'}}
						/>
					) : null}
				</div>
				<div className="border-b-2 border-black" />
				<div className="p-2">
					<div>
						{name ? (
							<strong className="font-brand ">{name}</strong>
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
