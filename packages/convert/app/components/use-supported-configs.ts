import {
	Mp4OutputFormat,
	WavOutputFormat,
	WebMOutputFormat,
	type InputFormat,
	type InputTrack,
} from 'mediabunny';
import {useEffect, useMemo, useState} from 'react';
import type {MediabunnyResize} from '~/lib/mediabunny-calculate-resize-option';
import type {OutputContainer, RouteAction} from '~/seo';
import type {SupportedConfigs} from './get-supported-configs';
import {getSupportedConfigs} from './get-supported-configs';

export const useSupportedConfigs = ({
	outputContainer,
	tracks,
	action,
	userRotation,
	inputContainer,
	resizeOperation,
	sampleRate,
}: {
	outputContainer: OutputContainer;
	tracks: InputTrack[] | null;
	action: RouteAction;
	userRotation: number;
	resizeOperation: MediabunnyResize | null;
	inputContainer: InputFormat | null;
	sampleRate: number | null;
}) => {
	const [state, setState] = useState<
		Record<OutputContainer, SupportedConfigs | null | undefined>
	>({
		mp4: null,
		webm: null,
		wav: null,
	});

	const outputFormat = useMemo(() => {
		if (outputContainer === 'mp4') {
			return new Mp4OutputFormat();
		}

		if (outputContainer === 'wav') {
			return new WavOutputFormat();
		}

		if (outputContainer === 'webm') {
			return new WebMOutputFormat();
		}

		throw new Error(
			'should not reach here' + (outputContainer satisfies never),
		);
	}, [outputContainer]);

	useEffect(() => {
		if (!tracks || !inputContainer) {
			return;
		}

		getSupportedConfigs({
			tracks,
			container: outputFormat,
			action,
			userRotation,
			resizeOperation,
			sampleRate,
		}).then((supportedConfigs) => {
			setState((prev) => ({
				...prev,
				[outputContainer]: supportedConfigs,
			}));
		});
	}, [
		action,
		inputContainer,
		outputContainer,
		outputFormat,
		resizeOperation,
		tracks,
		userRotation,
		sampleRate,
	]);

	return state[outputContainer] ?? null;
};
