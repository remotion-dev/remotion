import type {EnumPath} from './stringify-default-props';

export type VisualControlChange = {
	id: string;
	newValueSerialized: string;
	enumPaths: EnumPath[];
};

export type ApplyVisualControlCodemod = {
	type: 'apply-visual-control';
	changes: VisualControlChange[];
};

export type RecastCodemod =
	| {
			type: 'duplicate-composition';
			idToDuplicate: string;
			newId: string;
			newHeight: number | null;
			newWidth: number | null;
			newFps: number | null;
			newDurationInFrames: number | null;
			tag: 'Still' | 'Composition';
	  }
	| {
			type: 'rename-composition';
			idToRename: string;
			newId: string;
	  }
	| {
			type: 'delete-composition';
			idToDelete: string;
	  }
	| ApplyVisualControlCodemod;
