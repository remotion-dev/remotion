import {Composition, Folder, staticFile} from 'remotion';
import {CloseupShot} from './CloseupShot';
import {SetupCloseups} from './SetupCloseups';
import {SetupKeyScenes} from './SetupKeyScenes';
import {SetupLongTake} from './SetupLongTake';
import {SetupScene} from './SetupScene';
import {SetupShortTake} from './SetupShortTake';

export const SetupReviewCompositions = () => (
	<Folder name="Setup-Review">
		<Composition
			id="Setup-Closeups"
			component={SetupCloseups}
			width={1920}
			height={1080}
			fps={30}
			durationInFrames={3141}
		/>
		<Composition
			id="Setup-Closeup"
			component={CloseupShot}
			width={1920}
			height={1080}
			fps={30}
			durationInFrames={189}
			defaultProps={{
				src: staticFile('setup-review/closeups/IMG_0774-preview.mp4'),
				sourceStartSeconds: 0,
				sourceName: 'IMG_0774',
				title: 'Installed DMX terminator',
				detail:
					'Capped plug in DMX OUT, with the incoming DMX cable alongside. Insertion is not filmed.',
				category: 'TERMINATOR',
			}}
		/>
		<Composition
			id="Setup-Key-Scenes"
			component={SetupKeyScenes}
			width={1920}
			height={1080}
			fps={30}
			durationInFrames={8517}
		/>
		<Composition
			id="Setup-Long-Take"
			component={SetupLongTake}
			width={1920}
			height={1080}
			fps={30}
			durationInFrames={35552}
		/>
		<Composition
			id="Setup-Short-Take"
			component={SetupShortTake}
			width={1920}
			height={1080}
			fps={30}
			durationInFrames={14310}
		/>
		<Composition
			id="Setup-Scene"
			component={SetupScene}
			width={1920}
			height={1080}
			fps={30}
			durationInFrames={480}
			defaultProps={{
				src: staticFile('setup-review/short-take-preview.mp4'),
				stepIndex: 1,
				title: 'Attach the USB-C adapter',
				detail: 'Clear close-up, then connection to the laptop.',
				sourceName: 'SHORT TAKE · IMG_0758 · 07:57',
				sourceStartSeconds: 41,
				captions: [],
			}}
		/>
	</Folder>
);
