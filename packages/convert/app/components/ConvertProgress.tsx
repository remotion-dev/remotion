import {ConvertMediaState} from '@remotion/webcodecs';
import React from 'react';
import {formatBytes} from '~/lib/format-bytes';
import {formatSeconds} from '~/lib/format-seconds';

export const ConvertProgress: React.FC<{
	readonly state: ConvertMediaState;
}> = ({state}) => {
	return (
		<>
			<div>
				Bytes:{' '}
				<span className="tabular-nums font-brand">
					{formatBytes(state.bytesWritten)}
				</span>
			</div>
			<div>
				Duration:{' '}
				<span className="tabular-nums font-brand">
					{formatSeconds(state.millisecondsWritten / 1000)}
				</span>
			</div>
		</>
	);
};
