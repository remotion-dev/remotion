export type Composable =
	| {
			type: 'canvas';
			element: HTMLCanvasElement;
	  }
	| {
			type: 'svg';
			element: SVGSVGElement;
	  }
	| {
			type: 'img';
			element: HTMLImageElement;
	  };
