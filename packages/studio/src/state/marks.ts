import type {TimelineInOutContextValue} from './in-out';

const localStorageKey = () => `remotion.editor.marksv2`;

export const persistMarks = (marks: TimelineInOutContextValue) => {
	localStorage.setItem(localStorageKey(), JSON.stringify(marks));
};

export const loadMarks = (): TimelineInOutContextValue => {
	const item = localStorage.getItem(localStorageKey());

	if (item === null) {
		return {};
	}

	return JSON.parse(item);
};
