type DurationState = Record<string, number>;

type DurationAction = {
	type: 'got-duration';
	src: string;
	durationInSeconds: number;
};

export const durationReducer = (
	state: DurationState,
	action: DurationAction
) => {
	switch (action.type) {
		case 'got-duration':
			return {
				...state,
				[action.src]: action.durationInSeconds,
			};
		default:
			return state;
	}
};
