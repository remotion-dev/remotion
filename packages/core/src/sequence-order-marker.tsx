import type React from 'react';

export const SEQUENCE_ORDER_MARKER = Symbol.for(
	'remotion.sequence-order-marker',
);
export const SEQUENCE_MANAGER_ORDER_MARKER = Symbol.for(
	'remotion.sequence-manager-order-marker',
);
export const SEQUENCE_ORDER_EVENT = 'remotion:sequence-order';

export type SequenceOrderEventDetail = readonly {
	readonly managerId: string;
	readonly sequenceIds: readonly string[];
}[];

export const SequenceOrderMarker: React.FC<{
	readonly children: React.ReactNode;
	readonly sequenceId: string;
}> = ({children}) => children;

Object.defineProperty(SequenceOrderMarker, SEQUENCE_ORDER_MARKER, {
	value: true,
});

export const SequenceManagerOrderMarker: React.FC<{
	readonly children: React.ReactNode;
	readonly managerId: string;
}> = ({children}) => children;

Object.defineProperty(
	SequenceManagerOrderMarker,
	SEQUENCE_MANAGER_ORDER_MARKER,
	{
		value: true,
	},
);

export const SequenceOrderInternals = {
	managerMarker: SEQUENCE_MANAGER_ORDER_MARKER,
	sequenceMarker: SEQUENCE_ORDER_MARKER,
	eventName: SEQUENCE_ORDER_EVENT,
};
