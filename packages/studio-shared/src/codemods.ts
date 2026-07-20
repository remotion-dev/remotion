import type {EnumPath} from './stringify-default-props';

export type VisualControlChange = {
	id: string;
	newValueSerialized: string;
	newValueIsUndefined: boolean;
	enumPaths: EnumPath[];
};

export type ApplyVisualControlCodemod = {
	type: 'apply-visual-control';
	changes: VisualControlChange[];
};

export type RecastCodemod =
	| {
			type: 'new-composition';
			newId: string;
			componentName: string;
			componentImportPath: string;
			folderName: string | null;
			parentName: string | null;
			newHeight: number;
			newWidth: number;
			newFps: number;
			newDurationInFrames: number;
	  }
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
			type: 'update-composition-metadata';
			idToUpdate: string;
			newDurationInFrames: number | null;
			newFps: number | null;
			newHeight: number | null;
			newWidth: number | null;
	  }
	| {
			type: 'delete-composition';
			idToDelete: string;
	  }
	| {
			type: 'move-composition-to-folder';
			idToMove: string;
			folderName: string | null;
			parentName: string | null;
	  }
	| {
			type: 'rename-folder';
			folderName: string;
			parentName: string | null;
			newName: string;
	  }
	| {
			type: 'new-folder';
			folderName: string;
			parentName: string | null;
	  }
	| {
			type: 'delete-folder';
			folderName: string;
			parentName: string | null;
	  }
	| ApplyVisualControlCodemod;
