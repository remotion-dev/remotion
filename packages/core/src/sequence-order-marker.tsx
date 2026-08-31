import type React from 'react';

export const SEQUENCE_ORDER_MARKER = Symbol.for(
	'remotion.sequence-order-marker',
);
export const SEQUENCE_MANAGER_ORDER_MARKER = Symbol.for(
	'remotion.sequence-manager-order-marker',
);
export const COMPOSITION_ORDER_MARKER = Symbol.for(
	'remotion.composition-order-marker',
);
export const FOLDER_ORDER_MARKER = Symbol.for('remotion.folder-order-marker');
export const COMPOSITION_MANAGER_ORDER_MARKER = Symbol.for(
	'remotion.composition-manager-order-marker',
);
export const COMMIT_ORDER_EVENT = 'remotion:commit-order';

export type CompositionAndFolderOrderItem =
	| {readonly type: 'composition'; readonly id: string}
	| {readonly type: 'folder'; readonly id: string};

export const getCompositionAndFolderOrderKey = (
	item: CompositionAndFolderOrderItem,
) => `${item.type}:${item.id}`;

export type CommitOrderEventDetail = {
	readonly sequenceManagers: readonly {
		readonly managerId: string;
		readonly sequenceIds: readonly string[];
	}[];
	readonly compositionManagers: readonly {
		readonly managerId: string;
		readonly compositionAndFolderOrder: readonly CompositionAndFolderOrderItem[];
	}[];
};

export const getFolderOrderId = ({
	name,
	parent,
}: {
	readonly name: string;
	readonly parent: string | null;
}) => [parent, name].filter(Boolean).join('/');

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

export const CompositionOrderMarker: React.FC<{
	readonly children: React.ReactNode;
	readonly compositionId: string;
}> = ({children}) => children;

Object.defineProperty(CompositionOrderMarker, COMPOSITION_ORDER_MARKER, {
	value: true,
});

export const FolderOrderMarker: React.FC<{
	readonly children: React.ReactNode;
	readonly folderId: string;
}> = ({children}) => children;

Object.defineProperty(FolderOrderMarker, FOLDER_ORDER_MARKER, {
	value: true,
});

export const CompositionManagerOrderMarker: React.FC<{
	readonly children: React.ReactNode;
	readonly managerId: string;
}> = ({children}) => children;

Object.defineProperty(
	CompositionManagerOrderMarker,
	COMPOSITION_MANAGER_ORDER_MARKER,
	{value: true},
);

export const CommitOrderInternals = {
	compositionManagerMarker: COMPOSITION_MANAGER_ORDER_MARKER,
	compositionMarker: COMPOSITION_ORDER_MARKER,
	folderMarker: FOLDER_ORDER_MARKER,
	sequenceManagerMarker: SEQUENCE_MANAGER_ORDER_MARKER,
	sequenceMarker: SEQUENCE_ORDER_MARKER,
	eventName: COMMIT_ORDER_EVENT,
};
