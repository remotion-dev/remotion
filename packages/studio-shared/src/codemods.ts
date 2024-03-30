export type RecastCodemod =
	| {
			type: 'duplicate-composition';
			idToDuplicate: string;
			newId: string;
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
