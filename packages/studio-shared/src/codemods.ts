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
	  };
