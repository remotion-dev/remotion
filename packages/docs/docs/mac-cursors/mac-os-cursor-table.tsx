import {MacOSCursor} from '@remotion/mac-cursors';
import {Thumbnail} from '@remotion/player';
import React from 'react';

const cursors = [
	'alias',
	'all-scroll',
	'auto',
	'beachball',
	'busy',
	'cell',
	'col-resize',
	'context-menu',
	'copy',
	'crosshair',
	'e-resize',
	'grab',
	'grabbing',
	'handpointing',
	'help',
	'n-resize',
	'ne-resize',
	'nesw-resize',
	'no-drop',
	'ns-resize',
	'nw-resize',
	'nwse-resize',
	'poof',
	'resizedown',
	'resizeleft',
	'resizeright',
	'resizesouth',
	'resizesoutheast',
	'resizesouthwest',
	'resizeup',
	'resizeupdown',
	'resizewest',
	'resizewesteast',
	'screenshotselection',
	'screenshotwindow',
	'text',
	'textcursorvertical',
	'zoom-in',
	'zoom-out',
];

const hotspotStyle: React.CSSProperties = {
	position: 'absolute',
	backgroundColor: '#ff2d8d',
};

const CursorPreview: React.FC<{readonly cursor: string}> = ({cursor}) => {
	return (
		<>
			<MacOSCursor cursor={cursor} style={{left: 48, top: 32, scale: 1.5}} />
			<div
				style={{
					...hotspotStyle,
					left: 41,
					top: 31,
					width: 14,
					height: 2,
				}}
			/>
			<div
				style={{
					...hotspotStyle,
					left: 47,
					top: 25,
					width: 2,
					height: 14,
				}}
			/>
		</>
	);
};

export const MacOSCursorTable: React.FC = () => {
	return (
		<table>
			<thead>
				<tr>
					<th>Cursor</th>
					<th>Preview</th>
				</tr>
			</thead>
			<tbody>
				{cursors.map((cursor) => (
					<tr key={cursor}>
						<td>
							<code>{cursor}</code>
						</td>
						<td>
							<Thumbnail
								component={CursorPreview}
								inputProps={{cursor}}
								compositionWidth={96}
								compositionHeight={64}
								durationInFrames={1}
								fps={30}
								frameToDisplay={0}
								noSuspense
								style={{
									width: 96,
									height: 64,
									backgroundColor: 'transparent',
								}}
							/>
						</td>
					</tr>
				))}
			</tbody>
		</table>
	);
};
