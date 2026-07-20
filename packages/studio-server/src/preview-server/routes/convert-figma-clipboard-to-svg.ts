import type {
	ConvertFigmaClipboardToSvgRequest,
	ConvertFigmaClipboardToSvgResponse,
} from '@remotion/studio-shared';
import {convertFigmaClipboardToSvg} from '../../figma/figma-clipboard';
import type {ApiHandler} from '../api-types';

export const convertFigmaClipboardToSvgHandler: ApiHandler<
	ConvertFigmaClipboardToSvgRequest,
	ConvertFigmaClipboardToSvgResponse
> = ({input}) => {
	try {
		const {svg} = convertFigmaClipboardToSvg(input.html);
		return Promise.resolve({success: true, svg});
	} catch (error) {
		const reason = error instanceof Error ? error.message : String(error);
		return Promise.resolve({
			reason: reason.replace(/^Cannot import Figma selection:\s*/i, ''),
			success: false,
		});
	}
};
