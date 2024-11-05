import {ConvertMediaState} from '@remotion/webcodecs';
import React from 'react';
import {formatBytes} from '~/lib/format-bytes';
import {formatSeconds} from '~/lib/format-seconds';

export const ConvertProgress: React.FC<{
	readonly state: ConvertMediaState;
}> = ({state}) => {
	return (
		<>
			<div>Bytes: {formatBytes(state.bytesWritten)}</div>
			<div>Duration: {formatSeconds(state.millisecondsWritten / 1000)}</div>
		</>
	);
};
