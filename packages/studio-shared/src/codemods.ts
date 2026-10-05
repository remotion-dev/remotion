import type {CanvasCaptureData} from './canvas-capture';
import type {EnumPath} from './stringify-default-props';

export type VisualControlChange = {
	id: string;
	newValueSerialized: string;
	newValueIsUndefined: boolean;
	enumPaths: EnumPath[];
};

export type NewCompositionAsset = {
	type: 'audio' | 'image' | 'video';
	src: string;
	durationInFrames: number;
};

export type CompositionOrFolder =
	| {
			type: 'composition';
			compositionId: string;
	  }
	| {
			type: 'folder';
			folderName: string;
			parentName: string | null;
	  };

export type CompositionDestination =
	| {type: 'root'}
	| {
			type: 'folder';
			folderName: string;
			parentName: string | null;
	  }
	| {
			type: 'before' | 'after';
			target: CompositionOrFolder;
	  };

export type NewCompositionOptions = {
	asset: NewCompositionAsset | null;
	newId: string;
	componentName: string;
	componentImportPath: string;
	folderName: string | null;
	parentName: string | null;
	newHeight: number;
	newWidth: number;
	newFps: number;
	newDurationInFrames: number;
	canvasCapture: {
		readonly videoFileName: string;
		readonly videoHeight: number;
		readonly videoWidth: number;
		readonly keyframeFps: number;
		readonly data: CanvasCaptureData;
	} | null;
};
