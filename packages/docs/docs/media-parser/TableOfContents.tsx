import React from 'react';
import {Grid} from '../../components/TableOfContents/Grid';
import {TOCItem} from '../../components/TableOfContents/TOCItem';

export const MediaParserGuideTableOfContents: React.FC = () => {
	return (
		<div>
			<Grid>
				<TOCItem link="/docs/media-parser/metadata">
					<strong>Getting video metadata</strong>
					<div>Simple examples of extracting video metadata</div>
				</TOCItem>
				<TOCItem link="/docs/media-parser/fast-and-slow">
					<strong>Fast and slow operations</strong>
					<div>Efficently use parseMedia()</div>
				</TOCItem>
				<TOCItem link="/docs/media-parser/tags">
					<strong>Extract ID3 tags and EXIF data</strong>
					<div>Get embedded tags from video files</div>
				</TOCItem>
				<TOCItem link="/docs/media-parser/support">
					<strong>Runtime supports</strong>
					<div>Where you can run Media Parser</div>
				</TOCItem>
				<TOCItem link="/docs/media-parser/webcodecs">
					<strong>WebCodecs</strong>
					<div>How Media Parser integrates with WebCodecs</div>
				</TOCItem>
			</Grid>
		</div>
	);
};

export const TableOfContents: React.FC = () => {
	return (
		<div>
			<Grid>
				<TOCItem link="/docs/media-parser/parse-media">
					<strong>{'parseMedia()'}</strong>
					<div>Parse a media file.</div>
				</TOCItem>
				<TOCItem link="/docs/media-parser/node-reader">
					<strong>{'nodeReader'}</strong>
					<div>Read a file from the local file system.</div>
				</TOCItem>
				<TOCItem link="/docs/media-parser/fetch-reader">
					<strong>{'fetchReader'}</strong>
					<div>
						Read a file using <code>fetch()</code>.
					</div>
				</TOCItem>
				<TOCItem link="/docs/media-parser/web-file-reader">
					<strong>{'webFileReader'}</strong>
					<div>
						Read a file from <code>&lt;input type=&quot;file&quot;&gt;</code>.
					</div>
				</TOCItem>
			</Grid>
		</div>
	);
};
