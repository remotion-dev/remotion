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
	  }
	| {
			type: 'expand-all';
			allHashes: string[];
	  }
	| {
			type: 'collapse-all';
			allHashes: string[];
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

	if (action.type === 'collapse-all') {
		return {
			...state,
			collapsed: action.allHashes.reduce((a, b) => {
				return {
					...[a],
					[b]: true,
				};
			}, {}),
		};
	}

	if (action.type === 'expand-all') {
		return {
			...state,
			collapsed: action.allHashes.reduce((a, b) => {
				return {
					...a,
					[b]: false,
				};
			}, {}),
		};
	}

	return state;
};
