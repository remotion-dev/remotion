import type {InputFormat, InputTrack} from 'mediabunny';
import {useEffect, useState} from 'react';
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

	useEffect(() => {
		if (!tracks || !inputContainer) {
			return;
		}

		getSupportedConfigs({
			tracks,
			container: outputContainer,
			bitrate: 128000,
			action,
			userRotation,
			inputContainer,
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
		tracks,
		userRotation,
		resizeOperation,
		sampleRate,
	]);

	return state[outputContainer] ?? null;
};
