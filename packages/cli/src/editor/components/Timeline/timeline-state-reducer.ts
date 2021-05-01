export type TimelineViewState = {
	collapsed: {[key: string]: boolean};
};

export type TimelineActionState =
	| {
			type: 'collapse';
			hash: string;
	  }
	| {
			type: 'expand';
			hash: string;
	  };

export const timelineStateReducer = (
	state: TimelineViewState,
	action: TimelineActionState
): TimelineViewState => {
	if (action.type === 'collapse') {
		return {
			...state,
			collapsed: {
				...state.collapsed,
				[action.hash]: true,
			},
		};
	}

	if (action.type === 'expand') {
		return {
			...state,
			collapsed: {
				...state.collapsed,
				[action.hash]: false,
			},
		};
	}

	return state;
};
