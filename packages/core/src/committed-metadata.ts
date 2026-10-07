import {createContext} from 'react';
import type {
	Provider,
	ProviderExoticComponent,
	ProviderProps,
	RefObject,
} from 'react';
import type {AnyComposition, TSequence} from './CompositionManager.js';
import type {TFolder} from './Folder.js';

const COMMITTED_METADATA_PROP = '_remotionCommitMetadata';
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

export type CommittedMetadata =
	| {
			readonly type: 'sequence';
			readonly id: string;
			readonly value: TSequence | null;
			readonly outlineChildrenRef: RefObject<Element | null> | null;
	  }
	| {
			readonly type: 'composition';
			readonly id: string;
			readonly value: AnyComposition;
	  }
	| {readonly type: 'folder'; readonly id: string; readonly value: TFolder}
	| {
			readonly type: 'sequence-manager';
			readonly id: string;
			readonly onCommit:
				| ((
						sequences: readonly TSequence[],
						sequenceIds: readonly string[],
				  ) => void)
				| null;
	  }
	| {
			readonly type: 'composition-manager';
			readonly id: string;
			readonly onCommit:
				| ((snapshot: CommittedCompositionSnapshot) => void)
				| null;
	  };

// This is the same provider, with an additional private prop type. Metadata
// stays outside its context value, so edits do not notify context consumers.
export const withCommittedMetadata = <T>(
	provider: Provider<T>,
): ProviderExoticComponent<
	ProviderProps<T> & {
		readonly [COMMITTED_METADATA_PROP]: CommittedMetadata | null;
	}
> => provider;

// Leaves without an existing provider still need a committed Fiber when their
// content is null. Its constant context value never carries registry metadata.
export const CommittedMetadataProvider = withCommittedMetadata(
	createContext(null).Provider,
);

export const CommittedMetadataInternals = {
	metadataProp: COMMITTED_METADATA_PROP as typeof COMMITTED_METADATA_PROP,
	eventName: COMMIT_ORDER_EVENT,
	installationMarker: COMMIT_OBSERVER_INSTALLATION_MARKER,
	failureMarker: COMMIT_OBSERVER_FAILURE_MARKER,
	registrationErrorEventName: COMMIT_REGISTRATION_ERROR_EVENT,
};
