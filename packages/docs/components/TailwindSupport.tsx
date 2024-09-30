import {CreateVideoInternals} from 'create-video';
import React from 'react';

export const TailwindSupport: React.FC = () => {
	const supportedTailwind = CreateVideoInternals.FEATURED_TEMPLATES.filter(
		(t) => t.allowEnableTailwind,
	);

	return (
		<ul>
			{supportedTailwind.map((t) => (
				<li key={t.shortName}>
					<a href={`/templates/${t.cliId}`}>{t.shortName}</a>
				</li>
			))}
		</ul>
	);
};
