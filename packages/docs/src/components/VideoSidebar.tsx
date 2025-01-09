import React from 'react';
import type {ShowcaseLink, ShowcaseVideo} from '../data/showcase-videos';

const container: React.CSSProperties = {
	padding: 20,
};

const title: React.CSSProperties = {
	fontWeight: 'bold',
	marginBottom: 12,
};
const description: React.CSSProperties = {
	fontSize: 13,
	marginBottom: 20,
};

const a: React.CSSProperties = {
	fontSize: 14,
	fontWeight: 'bold',
};

const getLinkLabel = (linkType: ShowcaseLink) => {
	switch (linkType) {
		case 'source_code':
			return 'Source code';
		case 'tutorial':
			return 'Tutorial';
		case 'website':
			return 'Website';
		case 'video':
			return 'Video';
		default:
			throw new Error("don't know link type");
	}
};

export const VideoSidebar: React.FC<{
	readonly video: ShowcaseVideo;
}> = ({video}) => {
	return (
		<div style={container}>
			<div style={title}>{video.title}</div>
			<div style={description}>{video.description}</div>

			{video.author && (
				<div style={description}>
					Created by{' '}
					<a style={a} target="_blank" href={video.author.url}>
						{video.author.name}
					</a>
					.
				</div>
			)}
			{video.links.map((link) => {
				return (
					<div key={link.url}>
						<a style={a} target="_blank" href={link.url}>
							{getLinkLabel(link.type)}
						</a>
					</div>
				);
			})}
		</div>
	);
};
