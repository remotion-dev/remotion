import {CreateVideoInternals} from 'create-video';
import React from 'react';
import {Composition, Folder, Still} from 'remotion';
import {articles} from '../data/articles';
import {experts} from '../data/experts';
import {AllTemplates} from './AllTemplates';
import {Article} from './Article';
import {Expert} from './Expert';
import {
	HomepageVideoComp,
	calculateMetadata,
	schema,
} from './HomepageVideo/Comp';
import {TemplateComp} from './Template';

export const RemotionRoot: React.FC = () => {
	return (
		<>
			<Folder name="experts">
				{experts.map((e) => {
					return (
						<Still
							key={e.slug}
							component={Expert}
							defaultProps={{
								expertId: e.slug,
							}}
							height={630}
							width={1200}
							id={`experts-${e.slug}`}
						/>
					);
				})}
			</Folder>
			<Folder name="articles">
				{articles.map((e) => {
					return (
						<Still
							key={e.compId}
							component={Article}
							defaultProps={{
								articleRelativePath: e.relativePath,
							}}
							height={630}
							width={1200}
							id={e.compId}
						/>
					);
				})}
			</Folder>
			<Folder name="templates">
				{CreateVideoInternals.FEATURED_TEMPLATES.map((e) => {
					return (
						<Still
							key={e.cliId}
							component={TemplateComp}
							defaultProps={{
								templateId: e.cliId,
							}}
							height={630}
							width={1200}
							id={`template-${e.cliId}`}
						/>
					);
				})}
			</Folder>
			<Still
				component={AllTemplates}
				width={1200}
				height={630}
				id="template-all"
			/>
			<Composition
				component={HomepageVideoComp}
				id="HomepageVideo"
				width={640}
				height={360}
				durationInFrames={120}
				fps={30}
				defaultProps={{
					theme: 'light',
					location: {
						country: 'US',
						city: 'New York',
					},
					trending: null,
				}}
				schema={schema}
				calculateMetadata={calculateMetadata}
			/>
		</>
	);
};
