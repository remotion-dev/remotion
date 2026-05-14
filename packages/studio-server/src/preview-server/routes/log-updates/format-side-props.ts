import {formatAddition, formatDeletion, type PropDelta} from './formatting';

export const formatSideProps = ({
	removedProps,
	addedProps,
}: {
	removedProps: PropDelta[];
	addedProps: PropDelta[];
}) => {
	const parts: string[] = [];

	for (const prop of removedProps) {
		parts.push(formatDeletion(prop));
	}

	for (const prop of addedProps) {
		parts.push(formatAddition(prop));
	}

	if (parts.length === 0) {
		return null;
	}

	return parts.join(', ');
};
