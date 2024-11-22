import {
	getAvailableContainers,
	getDefaultVideoCodec,
} from '@remotion/webcodecs';
import React from 'react';

export const DefaultVideoCodecs: React.FC = () => {
	return (
		<table>
			<thead>
				<tr>
					<th>Container</th>
					<th>Default video codec</th>
				</tr>
			</thead>
			{getAvailableContainers().map((container) => {
				return (
					<tr key={container}>
						<td>{container}</td>
						<td>
							<code>{JSON.stringify(getDefaultVideoCodec({container}))}</code>
						</td>
					</tr>
				);
			})}
		</table>
	);
};
