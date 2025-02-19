import {CreateVideoInternals} from 'create-video';
import React from 'react';

import {IconForTemplate} from './IconForTemplate';
import {MoreTemplatesButton} from './MoreTemplatesButton';
import {TemplateIcon} from './TemplateIcon';

export const ChooseTemplate: React.FC = () => {
	return (
		<div
			style={{
				display: 'flex',
				flexDirection: 'column',
			}}
		>
			<div
				style={{
					position: 'relative',
					textAlign: 'center',
				}}
			>
				<div
					className="no-scroll-bar"
					style={{
						backgroundColor: 'var(--background)',
						display: 'inline-flex',
						flexDirection: 'row',
						justifyContent: 'space-around',
						boxShadow: '0 0 4px 0px var(--ifm-color-emphasis-200)',
						borderRadius: 50,
						alignItems: 'center',
						padding: 8,
						width: '100%',
						maxWidth: '550px',
					}}
				>
					{CreateVideoInternals.FEATURED_TEMPLATES.filter(
						(f) => f.featuredOnHomePage,
					).map((template) => {
						return (
							<a
								key={template.cliId}
								className="text-inherit no-underline"
								href={`/templates/${template.cliId}`}
							>
								<TemplateIcon label={template.featuredOnHomePage!}>
									<IconForTemplate scale={0.7} template={template} />
								</TemplateIcon>
							</a>
						);
					})}
					<MoreTemplatesButton />
				</div>
			</div>
		</div>
	);
};
