import {MediaParserInternals} from '@remotion/media-parser';
import React from 'react';

export const DisallowForwardSeekingFields = () => {
	return (
		<ul>
			{Object.entries(MediaParserInternals.fieldsNeedSamplesMap)
				.filter(([, value]) => value)
				.map(([key]) => {
					return (
						<li>
							<a href={`/docs/media-parser/fields#${key.toLowerCase()}`}>
								<code>{key}</code>
							</a>
						</li>
					);
				})}
		</ul>
	);
};
