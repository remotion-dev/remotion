import {
	getAvailableContainers,
	getDefaultAudioCodec,
} from '@remotion/webcodecs';
import React from 'react';

export const DefaultAudioCodecs: React.FC = () => {
	return (
		<table>
			<thead>
				<tr>
					<th>Container</th>
					<th>Default audio codec</th>
				</tr>
			</thead>
			{getAvailableContainers().map((container) => {
				return (
					<tr key={container}>
						<td>{container}</td>
						<td>
							<code>{JSON.stringify(getDefaultAudioCodec({container}))}</code>
						</td>
					</tr>
				);
			})}
		</table>
	);
};
