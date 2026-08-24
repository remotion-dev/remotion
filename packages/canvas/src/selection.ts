export type CanvasEntityReference =
	| {
			readonly type: 'sequence';
			readonly id: string;
	  }
	| {
			readonly type: 'effect';
			readonly id: string;
			readonly sequenceId: string;
	  }
	| {
			readonly type: 'guide';
			readonly id: string;
	  };

export type CanvasPropertyPath = readonly (string | number)[];

export type CanvasSelectionItem =
	| {
			readonly type: 'entity';
			readonly entity: CanvasEntityReference;
	  }
	| {
			readonly type: 'property';
			readonly entity: CanvasEntityReference;
			readonly propertyPath: CanvasPropertyPath;
	  }
	| {
			readonly type: 'keyframe';
			readonly entity: CanvasEntityReference;
			readonly propertyPath: CanvasPropertyPath;
			readonly frame: number;
	  }
	| {
			readonly type: 'easing';
			readonly entity: CanvasEntityReference;
			readonly propertyPath: CanvasPropertyPath;
			readonly fromFrame: number;
			readonly toFrame: number;
			readonly segmentIndex: number;
	  };

export type CanvasSelectionSnapshot = {
	readonly selectedItems: readonly CanvasSelectionItem[];
	readonly anchor: CanvasSelectionItem | null;
};

export type CanvasSelectionMode = 'replace' | 'add' | 'toggle';

export const getCanvasSelectionItemKey = (
	item: CanvasSelectionItem,
): string => {
	const entity =
		item.entity.type === 'effect'
			? [item.entity.type, item.entity.sequenceId, item.entity.id]
			: [item.entity.type, item.entity.id];

	switch (item.type) {
		case 'entity':
			return JSON.stringify([item.type, entity]);
		case 'property':
			return JSON.stringify([item.type, entity, item.propertyPath]);
		case 'keyframe':
			return JSON.stringify([item.type, entity, item.propertyPath, item.frame]);
		case 'easing':
			return JSON.stringify([
				item.type,
				entity,
				item.propertyPath,
				item.fromFrame,
				item.toFrame,
				item.segmentIndex,
			]);
		default:
			throw new Error('Unknown Canvas selection item');
	}
};
