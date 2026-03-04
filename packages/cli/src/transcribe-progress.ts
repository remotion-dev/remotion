import {chalk} from './chalk';
import {makeProgressBar} from './make-progress-bar';
import {LABEL_WIDTH} from './progress-bar';
import {truthy} from './truthy';

type PhaseState =
	| {type: 'not-started'}
	| {type: 'in-progress'; progress: number | null; latestLine: string | null}
	| {type: 'done'; doneIn: number; alreadyExisted: boolean};

export type TranscribeProgress = {
	install: PhaseState;
	download: PhaseState;
	convert: PhaseState;
	transcribe: PhaseState;
};

export const initialTranscribeProgress: TranscribeProgress = {
	install: {type: 'not-started'},
	download: {type: 'not-started'},
	convert: {type: 'not-started'},
	transcribe: {type: 'not-started'},
};

const makePhaseProgress = ({
	label,
	doneLabel,
	state,
}: {
	label: string;
	doneLabel: string;
	state: PhaseState;
}): string | null => {
	if (state.type === 'not-started') {
		return null;
	}

	if (state.type === 'done') {
		if (state.alreadyExisted) {
			return null;
		}

		return [
			doneLabel.padEnd(LABEL_WIDTH, ' '),
			makeProgressBar(1, false),
			chalk.gray(`${state.doneIn}ms`),
		].join(' ');
	}

	if (state.progress !== null) {
		const clamped = Math.min(1, Math.max(0, state.progress));
		return [
			label.padEnd(LABEL_WIDTH, ' '),
			makeProgressBar(clamped, false),
			`${(clamped * 100).toFixed(0)}%`,
		].join(' ');
	}

	return [label.padEnd(LABEL_WIDTH, ' '), makeProgressBar(0, false)].join(' ');
};

export const makeTranscribeProgress = (
	progress: TranscribeProgress,
): string => {
	const installLine = makePhaseProgress({
		label: 'Installing Whisper',
		doneLabel: 'Installed Whisper',
		state: progress.install,
	});

	const downloadLine = makePhaseProgress({
		label: 'Downloading model',
		doneLabel: 'Downloaded model',
		state: progress.download,
	});

	const convertLine = makePhaseProgress({
		label: 'Converting audio',
		doneLabel: 'Converted audio',
		state: progress.convert,
	});

	const transcribeLine = makePhaseProgress({
		label: 'Transcribing',
		doneLabel: 'Transcribed',
		state: progress.transcribe,
	});

	const lines: string[] = [
		installLine,
		progress.install.type === 'in-progress' && progress.install.latestLine
			? chalk.gray(`  ${progress.install.latestLine.split('\n')[0]}`)
			: null,
		downloadLine,
		convertLine,
		transcribeLine,
	].filter(truthy);

	return lines.join('\n');
};
