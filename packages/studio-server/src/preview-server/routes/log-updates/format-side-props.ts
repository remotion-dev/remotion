import {formatAddition, formatDeletion, type PropDelta} from './formatting';

export const formatSideProps = ({
	removedProps,
	addedProps,
	color,
}: {
	removedProps: PropDelta[];
	addedProps: PropDelta[];
	color: boolean;
}) => {
	const parts: string[] = [];

	for (const prop of removedProps) {
		parts.push(formatDeletion(prop));
	}

	for (const prop of addedProps) {
		if (color) {
			parts.push(formatAddition(prop));
		}
	}

	if (parts.length === 0) {
		return null;
	}

	return parts.join(', ');
};
