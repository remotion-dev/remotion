import {CreateVideoInternals} from 'create-video';
import React from 'react';

export const CreateVideoTemplateFlags: React.FC = () => {
	return (
		<>
			{CreateVideoInternals.FEATURED_TEMPLATES.map((t) => (
				<code key={t.cliId}>--{t.cliId}</code>
			)).reduce<React.ReactNode[]>((acc, el, i) => {
				if (i === 0) return [el];
				return [...acc, ', ', el];
			}, [])}
		</>
	);
};
