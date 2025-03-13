import {CreateVideoInternals} from 'create-video';
import React from 'react';
import {Folder, Still} from 'remotion';
import {articles} from '../data/articles';
import {experts} from '../data/experts';
import {AllTemplates} from './AllTemplates';
import {Article} from './Article';
import {Expert} from './Expert';
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
			{/* <Composition
				component={HomepageVideoComp}
				id="HomepageVideo"
				width={640}
				height={360}
				durationInFrames={120}
				fps={30}
				defaultProps={{
					theme: 'dark',
					cardOrder: [0, 1, 2, 3],
					location: {
						country: 'CH',
						city: 'Zurich',
						longitude: '8.5348',
						latitude: '47.3857',
					},
					trending: {
						repos: [
							'open-mmlab/Amphion',
							'usememos/memos',
							'meta-llama/llama-recipes',
						],
						date: 1730369257379,
						temperatureInCelsius: 11,
						countryLabel: 'Switzerland',
						countryPaths: [
							{
								class: 'CH',
								d: 'M1034.4 197.5l0.2 1.1-0.7 1.5 2.3 1.2 2.6 0.2-0.3 2.5-2.1 1.1-3.8-0.8-1 2.5-2.4 0.2-0.9-1-2.7 2.2-2.5 0.3-2.2-1.4-1.8-2.7-2.4 1 0-2.9 3.6-3.5-0.2-1.6 2.3 0.6 1.3-1.1 4.2 0 1-1.3 5.5 1.9z',
							},
						],
					},
					emojiIndex: 0,
					onClickLeft: () => {},
					onClickRight: () => {},
					onToggle: () => {},
					updateCardOrder: () => {},
				}}
				calculateMetadata={calculateMetadata}
			/> */}
		</>
	);
};
