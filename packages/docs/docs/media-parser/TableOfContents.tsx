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
				<TOCItem link="/docs/media-parser/fields">
					<strong>Available fields</strong>
					<div>Information you can get using the media parser</div>
				</TOCItem>
				<TOCItem link="/docs/media-parser/fast-and-slow">
					<strong>Fast and slow operations</strong>
					<div>Efficently use parseMedia()</div>
				</TOCItem>
				<TOCItem link="/docs/media-parser/pause-resume-abort">
					<strong>Pause, resume and abort</strong>
					<div>Steer the parsing process</div>
				</TOCItem>
				<TOCItem link="/docs/media-parser/tags">
					<strong>Extract ID3 tags and EXIF data</strong>
					<div>Get embedded tags from video files</div>
				</TOCItem>
				<TOCItem link="/docs/media-parser/format-support">
					<strong>Format support</strong>
					<div>What you can parse with Media Parser</div>
				</TOCItem>
				<TOCItem link="/docs/media-parser/runtime-support">
					<strong>Runtime support</strong>
					<div>Where you can run Media Parser</div>
				</TOCItem>
				<TOCItem link="/docs/media-parser/foreign-file-types">
					<strong>Foreign file types</strong>
					<div>
						Get information from the errors when passing unsupported file types
					</div>
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
				<TOCItem link="/docs/media-parser/download-and-parse-media">
					<strong>{'downloadAndParseMedia()'}</strong>
					<div>Download and parse a media file.</div>
				</TOCItem>
				<TOCItem link="/docs/media-parser/media-parser-controller">
					<strong>{'mediaParserController()'}</strong>
					<div>Pause, resume and abort the parse.</div>
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
				<TOCItem link="/docs/media-parser/node-writer">
					<strong>{'nodeWriter'}</strong>
					<div>Write a file to the local file system using Node.</div>
				</TOCItem>
			</Grid>
		</div>
	);
};
