import {ConvertMediaState} from '@remotion/webcodecs';
import React from 'react';
import {formatBytes} from '~/lib/format-bytes';
import {formatSeconds} from '~/lib/format-seconds';
import {Card} from './ui/card';

export const ConvertProgress: React.FC<{
	readonly state: ConvertMediaState;
}> = ({state}) => {
	return (
		<>
			<Card>
				<div className="p-2">
					<span className="tabular-nums font-brand">
						{formatSeconds(state.millisecondsWritten / 1000)}
					</span>
					{' • '}
					<span className="tabular-nums font-brand">
						{formatBytes(state.bytesWritten)}
					</span>
				</div>
			</Card>
		</>
	);
};
