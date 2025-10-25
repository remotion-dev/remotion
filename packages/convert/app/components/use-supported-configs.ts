import type {OutputFormat} from 'mediabunny';
import {type InputFormat, type InputTrack} from 'mediabunny';
import {useEffect, useMemo, useState} from 'react';
import type {MediabunnyResize} from '~/lib/mediabunny-calculate-resize-option';
import {getMediabunnyOutput} from '~/lib/output-container';
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
		Record<OutputFormat['mimeType'], SupportedConfigs | null | undefined>
	>({});

	const outputFormat = useMemo(() => {
		return getMediabunnyOutput(outputContainer);
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
