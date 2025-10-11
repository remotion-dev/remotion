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
					<div>
						Efficently use <code>parseMedia()</code>
					</div>
				</TOCItem>
				<TOCItem link="/docs/media-parser/samples">
					<strong>Extract samples</strong>
					<div>Extract video and audio samples from a media file</div>
				</TOCItem>
				<TOCItem link="/docs/media-parser/readers">
					<strong>Readers</strong>
					<div>Read from a variety of sources</div>
				</TOCItem>
				<TOCItem link="/docs/media-parser/pause-resume-abort">
					<strong>Pause, resume and abort</strong>
					<div>Steer the parsing process</div>
				</TOCItem>
				<TOCItem link="/docs/media-parser/seeking">
					<strong>Seeking</strong>
					<div>Seek to a different position in a media file</div>
				</TOCItem>
				<TOCItem link="/docs/media-parser/format-support">
					<strong>Format support</strong>
					<div>What you can parse</div>
				</TOCItem>
				<TOCItem link="/docs/media-parser/runtime-support">
					<strong>Runtime support</strong>
					<div>Where you can run it</div>
				</TOCItem>
				<TOCItem link="/docs/media-parser/tags">
					<strong>Extract ID3 tags and EXIF data</strong>
					<div>Get embedded tags from video files</div>
				</TOCItem>
				<TOCItem link="/docs/media-parser/workers">
					<strong>Web Workers</strong>
					<div>Parse a media file in the browser on a separate thread.</div>
				</TOCItem>
				<TOCItem link="/docs/media-parser/download-and-parse">
					<strong>Download and parse</strong>
					<div>Download a media file to disk and parse it simultaneously</div>
				</TOCItem>
				<TOCItem link="/docs/media-parser/foreign-file-types">
					<strong>Foreign file types</strong>
					<div>
						Get information from the errors when passing unsupported file types
					</div>
				</TOCItem>
				<TOCItem link="/docs/media-parser/webcodecs">
					<strong>WebCodecs</strong>
					<div>Decode video and audio frames in the browser</div>
				</TOCItem>
				<TOCItem link="/docs/media-parser/stream-selection">
					<strong>Stream selection</strong>
					<div>Choose which streams to use in a HLS Playlist</div>
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
				<TOCItem link="/docs/media-parser/parse-media-on-web-worker">
					<strong>{'parseMediaOnWebWorker()'}</strong>
					<div>Parse a media file in the browser on a separate thread.</div>
				</TOCItem>
				<TOCItem link="/docs/media-parser/parse-media-on-server-worker">
					<strong>{'parseMediaOnServerWorker()'}</strong>
					<div>Parse a media file on the server on a separate thread.</div>
				</TOCItem>
				<TOCItem link="/docs/media-parser/media-parser-controller">
					<strong>{'mediaParserController()'}</strong>
					<div>Pause, resume and abort the parsing.</div>
				</TOCItem>
				<TOCItem link="/docs/media-parser/has-been-aborted">
					<strong>{'hasBeenAborted()'}</strong>
					<div>Determine from an error if the parsing has been aborted.</div>
				</TOCItem>
				<TOCItem link="/docs/media-parser/webcodecs-timescale">
					<strong>{'WEBCODECS_TIMESCALE'}</strong>
					<div>
						The global timescale (<code>1_000_000</code>) of WebCodecs as a
						constant.
					</div>
				</TOCItem>
			</Grid>
		</div>
	);
};

export const ReadersTableOfContents: React.FC = () => {
	return (
		<div>
			<Grid>
				<TOCItem link="/docs/media-parser/node-reader">
					<strong>{'nodeReader'}</strong>
					<div>Read a file from the local file system.</div>
				</TOCItem>
				<TOCItem link="/docs/media-parser/web-reader">
					<strong>{'webReader'}</strong>
					<div>
						Read a file from a <code>File</code> or from a URL.
					</div>
				</TOCItem>
				<TOCItem link="/docs/media-parser/universal-reader">
					<strong>{'universalReader'}</strong>
					<div>
						Read a file from a <code>File</code>, from a URL or from the local
						file system
					</div>
				</TOCItem>
			</Grid>
		</div>
	);
};

export const WritersTableOfContents: React.FC = () => {
	return (
		<div>
			<Grid>
				<TOCItem link="/docs/media-parser/node-writer">
					<strong>{'nodeWriter'}</strong>
					<div>Write a file to the local file system using Node.</div>
				</TOCItem>
			</Grid>
		</div>
	);
};

export const TypesTableOfContents: React.FC = () => {
	return (
		<div>
			<Grid>
				<TOCItem link="/docs/media-parser/types">
					<strong>{'TypeScript types'}</strong>
					<div>Reference for the types returned by Media Parser.</div>
				</TOCItem>
			</Grid>
		</div>
	);
};
