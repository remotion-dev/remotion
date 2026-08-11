import type {ShadowBase} from '../parse-shadow';
import {parseShadowValues} from '../parse-shadow';

export type TextShadow = ShadowBase;

export const parseTextShadow = (textShadowValue: string): TextShadow[] => {
	return parseShadowValues(textShadowValue);
};
