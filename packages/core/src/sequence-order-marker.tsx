import type React from 'react';
import type {AnyComposition, TSequence} from './CompositionManager.js';
import type {TFolder} from './Folder.js';

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
export const COMMIT_REGISTRATION_ERROR_EVENT =
	'remotion:commit-registration-error';
const COMMIT_OBSERVER_INSTALLATION_MARKER = Symbol.for(
	'remotion.commit-order-observer-installed',
);
const COMMIT_OBSERVER_FAILURE_MARKER = Symbol.for(
	'remotion.commit-registration-observer-failed',
);

export const isCommitRegistrationObserverInstalled = () => {
	if (typeof window === 'undefined') {
		return false;
	}

	const hook = Reflect.get(window, '__REACT_DEVTOOLS_GLOBAL_HOOK__');
	return (
		typeof hook === 'object' &&
		hook !== null &&
		Reflect.get(hook, 'isDisabled') !== true &&
		Reflect.get(hook, COMMIT_OBSERVER_INSTALLATION_MARKER) === true &&
		Reflect.get(hook, COMMIT_OBSERVER_FAILURE_MARKER) !== true
	);
};

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

export type CommittedSequenceSnapshot = {
	readonly sequences: readonly TSequence[];
	readonly sequenceIds: readonly string[];
};

export type CommittedCompositionSnapshot = {
	readonly compositions: readonly AnyComposition[];
	readonly folders: readonly TFolder[];
	readonly orderIds: readonly string[];
};

export const SequenceOrderMarker: React.FC<{
	readonly children: React.ReactNode;
	readonly sequenceId: string;
	readonly registration: TSequence | null;
	readonly outlineChildrenRef: React.RefObject<Element | null> | null;
}> = ({children}) => children;

Object.defineProperty(SequenceOrderMarker, SEQUENCE_ORDER_MARKER, {
	value: true,
});

export const SequenceManagerOrderMarker: React.FC<{
	readonly children: React.ReactNode;
	readonly managerId: string;
	readonly onCommitSequences:
		| ((
				sequences: readonly TSequence[],
				sequenceIds: readonly string[],
		  ) => void)
		| null;
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
	readonly registration: AnyComposition | null;
}> = ({children}) => children;

Object.defineProperty(CompositionOrderMarker, COMPOSITION_ORDER_MARKER, {
	value: true,
});

export const FolderOrderMarker: React.FC<{
	readonly children: React.ReactNode;
	readonly folderId: string;
	readonly registration: TFolder | null;
}> = ({children}) => children;

Object.defineProperty(FolderOrderMarker, FOLDER_ORDER_MARKER, {
	value: true,
});

export const CompositionManagerOrderMarker: React.FC<{
	readonly children: React.ReactNode;
	readonly managerId: string;
	readonly onCommitRegistrations:
		| ((snapshot: CommittedCompositionSnapshot) => void)
		| null;
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
	installationMarker: COMMIT_OBSERVER_INSTALLATION_MARKER,
	failureMarker: COMMIT_OBSERVER_FAILURE_MARKER,
	registrationErrorEventName: COMMIT_REGISTRATION_ERROR_EVENT,
};
