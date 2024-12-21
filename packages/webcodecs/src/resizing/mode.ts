export type Dimensions = {
	width: number;
	height: number;
};

export type ResizingOperation =
	| {
			mode: 'width';
			width: number;
	  }
	| {
			mode: 'height';
			height: number;
	  }
	| {
			mode: 'max-height';
			maxHeight: number;
	  }
	| {
			mode: 'max-width';
			maxWidth: number;
	  }
	| {
			mode: 'max-height-width';
			maxHeight: number;
			maxWidth: number;
	  };
