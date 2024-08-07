import {supportsHyperlink} from './is-supported';

const OSC = '\u001B]';
const SEP = ';';
const BEL = '\u0007';

export const makeHyperlink = ({
	text,
	url,
	fallback,
}: {
	text: string | ((clickInstruction: string) => string);
	url: string;
	fallback: string;
}) => {
	const supports = supportsHyperlink();
	if (!supports) {
		return fallback;
	}

	const label = typeof text === 'function' ? text(supports) : text;

	return [OSC, '8', SEP, SEP, url, BEL, label, OSC, '8', SEP, SEP, BEL].join(
		'',
	);
};
