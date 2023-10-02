type Dimensions = {
	top: number;
	left: number;
	width: number;
	height: number;
};

export type Application = {
	application: {
		blockSize: number;
		blocks: number[];
		codes: number[];
		id: string;
	};
};

type Lct = {
	exists: boolean;
	future: number;
	interlaced: boolean;
	size: number;
	sort: boolean;
};

export type Frame = {
	gce:
		| undefined
		| {
				byteSize: number;
				codes: number[];
				delay: number;
				terminator: number;
				transparentColorIndex: number;
				extras: {
					userInput: boolean;
					transparentColorGiven: boolean;
					future: number;
					disposal: number;
				};
		  };
	image: {
		code: number;
		data: {
			minCodeSize: number;
			blocks: number[];
		};
		descriptor: {
			top: number;
			left: number;
			width: number;
			height: number;
			lct: Lct;
		};
		lct: [number, number, number][] | undefined;
	};
};

export type ParsedFrame = {
	dims: {width: number; height: number; top: number; left: number};
	colorTable: [number, number, number][];
	delay: number;
	disposalType: number;
	patch: Uint8ClampedArray;
	pixels: number[];
	transparentIndex: number;
};

export type ParsedFrameWithoutPatch = Omit<ParsedFrame, 'patch'>;

export type ParsedGif = {
	frames: (Application | Frame)[];
	gct: [number, number, number][];
	header: {
		signature: string;
		version: string;
	};
	lsd: {
		backgroundColorIndex: number;
		gct: {
			exists: boolean;
			resolution: number;
			size: number;
			sort: boolean;
		};
		height: number;
		width: number;
		pixelAspectRatio: number;
	};
};

export type Image = {
	pixels: number[];
	dims: Dimensions;
	delay?: number;
	transparentIndex?: number;
	colorTable?: [number, number, number][] | Lct;
	disposalType?: unknown;
	patch?: Uint8ClampedArray;
};
