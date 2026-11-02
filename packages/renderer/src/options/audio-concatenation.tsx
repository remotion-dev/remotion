import type {AudioConcatenation} from '../can-concat-seamlessly';
import {validateAudioConcatenation} from '../can-concat-seamlessly';
import type {AnyRemotionOption} from './option';

const DEFAULT: AudioConcatenation = 'seamless-if-possible';

const cliFlag = 'audio-concatenation' as const;

export const audioConcatenationOption = {
	name: 'Audio concatenation',
	addedIn: '4.0.540',
	cliFlag,
	description: () => (
		<>
			How the audio of the chunks of a Lambda render is joined. One of:
			<ul>
				<li>
					<code>seamless-if-possible</code> (default): If the audio codec is{' '}
					<code>aac</code> and every chunk is longer than 4 frames, each Lambda
					function encodes its chunk&apos;s audio to AAC, and the chunks are
					joined without re-encoding. To join AAC without gaps, each function
					evaluates a few extra frames before and after its chunk for their
					audio. Otherwise, the same as <code>encode-at-merge</code>.
				</li>
				<li>
					<code>encode-at-merge</code>: Each Lambda function keeps its
					chunk&apos;s audio uncompressed, and the main function encodes the
					joined audio once. No function evaluates extra frames, which makes
					renders with many or short chunks faster and cheaper. Merging takes
					longer because the whole audio track gets encoded in the main
					function.
				</li>
			</ul>
		</>
	),
	ssrName: 'audioConcatenation' as const,
	docLink: 'https://www.remotion.dev/docs/options/audio-concatenation',
	type: DEFAULT as AudioConcatenation,
	getValue: ({commandLine}) => {
		if (commandLine[cliFlag] !== undefined) {
			return {
				source: 'cli',
				value: validateAudioConcatenation(commandLine[cliFlag]),
			};
		}

		return {
			source: 'default',
			value: DEFAULT,
		};
	},
	setConfig: () => {
		throw new Error('Not implemented');
	},
	id: cliFlag,
} satisfies AnyRemotionOption<AudioConcatenation>;
