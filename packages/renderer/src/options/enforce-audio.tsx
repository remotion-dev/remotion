import type {AnyRemotionOption} from './option';

const DEFAULT_ENFORCE_AUDIO_TRACK = false;

let enforceAudioTrackState = DEFAULT_ENFORCE_AUDIO_TRACK;

const cliFlag = 'enforce-audio-track' as const;

export const enforceAudioOption = {
	name: 'Enforce Audio Track',
	cliFlag,
	description: (mode) => (
		<>
			<p>
				Defaults to <code>false</code>. If <code>true</code>, include a silent
				audio track when the render contains no audio. If <code>false</code>,
				omit the audio track when no audio is present. Audio-only exports still
				produce an audio file, even when silent.
			</p>
			<p>
				{mode === 'cli' ? (
					<>
						Pass <code>--enforce-audio-track</code>
					</>
				) : (
					<>
						Set this to <code>true</code>
					</>
				)}{' '}
				for{' '}
				<a href="/docs/distributed-rendering">
					chunks that will later be concatenated
				</a>
				, because other chunks may contain audio.{' '}
				<code>{mode === 'cli' ? '--muted' : 'muted: true'}</code> takes
				precedence.
			</p>
			<p>
				In Remotion 4, video renders may still include a silent audio track when
				this option is <code>false</code>. This is fixed in Remotion 5.
			</p>
		</>
	),
	ssrName: 'enforceAudioTrack',
	docLink: 'https://www.remotion.dev/docs/config#setenforceaudiotrack-',
	type: false as boolean,
	getValue: ({commandLine}) => {
		if (commandLine[cliFlag]) {
			return {
				source: 'cli',
				value: true,
			};
		}

		if (enforceAudioTrackState !== DEFAULT_ENFORCE_AUDIO_TRACK) {
			return {
				source: 'config',
				value: enforceAudioTrackState,
			};
		}

		return {
			source: 'default',
			value: DEFAULT_ENFORCE_AUDIO_TRACK,
		};
	},
	setConfig: (value) => {
		enforceAudioTrackState = value;
	},
	id: cliFlag,
} satisfies AnyRemotionOption<boolean>;
