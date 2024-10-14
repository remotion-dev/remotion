import React from 'react';
import {Grid} from '../../components/TableOfContents/Grid';
import {TOCItem} from '../../components/TableOfContents/TOCItem';

export const PlayerTableOfContents: React.FC = () => {
	return (
		<div>
			<Grid>
				<TOCItem link="/docs/player/player">
					<strong>{'<Player>'}</strong>
					<div>Embed a Remotion composition in a web app</div>
				</TOCItem>
				<TOCItem link="/docs/player/thumbnail">
					<strong>{'<Thumbnail>'}</strong>
					<div>Embed a still in a web app</div>
				</TOCItem>
			</Grid>
		</div>
	);
};

export const PlayerGuide: React.FC = () => {
	return (
		<div>
			<Grid>
				<TOCItem link="/docs/player/installation">
					<strong>Installation</strong>
					<div>Install the Player into your project</div>
				</TOCItem>
				<TOCItem link="/docs/player/examples">
					<strong>Examples</strong>
					<div>Code samples for various scenarios</div>
				</TOCItem>
				<TOCItem link="/docs/player/scaling">
					<strong>Sizing</strong>
					<div>Setting the size of the Player</div>
				</TOCItem>
				<TOCItem link="/docs/player/autoplay">
					<strong>Autoplay</strong>
					<div>Dealing with browser autoplay policies</div>
				</TOCItem>
				<TOCItem link="/docs/player/current-time">
					<strong>Display time</strong>
					<div>Write a custom component for displaying the current time</div>
				</TOCItem>
				<TOCItem link="/docs/player/preloading">
					<strong>Preloading assets</strong>
					<div>Make assets ready to play when they appear in the video</div>
				</TOCItem>
				<TOCItem link="/docs/player/best-practices">
					<strong>Best practices</strong>
					<div>Checklist of correct implementation</div>
				</TOCItem>
				<TOCItem link="/docs/player/buffer-state">
					<strong>Buffer state</strong>
					<div>Pause the Player while assets are loading</div>
				</TOCItem>
				<TOCItem link="/docs/troubleshooting/player-flicker">
					<strong>Avoiding flickers</strong>
					<div>Troubleshooting for flickers due to unloaded assets</div>
				</TOCItem>
				<TOCItem link="/docs/player/premounting">
					<strong>Premounting</strong>
					<div>Mount components earlier to allow them to load</div>
				</TOCItem>
				<TOCItem link="/docs/player/drag-and-drop">
					<strong>Drag & Drop</strong>
					<div>Allow interactivity on the canvas</div>
				</TOCItem>
				<TOCItem link="/docs/player/custom-controls">
					<strong>Custom controls</strong>
					<div>Recipes for custom Play buttons, volume sliders, etc.</div>
				</TOCItem>
				<TOCItem link="/docs/player/media-keys">
					<strong>Media Keys</strong>
					<div>Control what happens when users presses ⏯️</div>
				</TOCItem>
			</Grid>
		</div>
	);
};
