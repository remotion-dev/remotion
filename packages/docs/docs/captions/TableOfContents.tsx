import React from 'react';
import {Grid} from '../../components/TableOfContents/Grid';
import {TOCItem} from '../../components/TableOfContents/TOCItem';

export const TableOfContents: React.FC = () => {
	return (
		<div>
			<Grid>
				<TOCItem link="/docs/captions/caption">
					<strong>{'Caption'}</strong>
					<div>An object shape for captions</div>
				</TOCItem>
				<TOCItem link="/docs/captions/parse-srt">
					<strong>{'parseSrt()'}</strong>
					<div>
						Parse a .srt file into a <code>Caption</code> array
					</div>
				</TOCItem>
				<TOCItem link="/docs/captions/serialize-srt">
					<strong>{'serializeSrt()'}</strong>
					<div>
						Serialize a .srt file into a <code>Caption</code> array
					</div>
				</TOCItem>
				<TOCItem link="/docs/captions/create-tiktok-style-captions">
					<strong>{'createTikTokStyleCaptions()'}</strong>
					<div>Structure the captions for TikTok-style display</div>
				</TOCItem>
			</Grid>
		</div>
	);
};
