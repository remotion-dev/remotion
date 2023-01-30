export type Instruction =
	| {
			type: 'M';
			x: number;
			y: number;
	  }
	| {
			type: 'L';
			x: number;
			y: number;
	  }
	| {
			type: 'C';
			cp1x: number;
			cp1y: number;
			cp2x: number;
			cp2y: number;
			x: number;
			y: number;
	  }
	| {
			type: 'a';
			rx: number;
			ry: number;
			xAxisRotation: number;
			largeArcFlag: boolean;
			sweepFlag: boolean;
			x: number;
			y: number;
	  }
	| {
			type: 'A';
			rx: number;
			ry: number;
			xAxisRotation: number;
			largeArcFlag: boolean;
			sweepFlag: boolean;
			x: number;
			y: number;
	  }
	| {
			type: 'z';
	  };

export const serializeInstructions = (instructions: Instruction[]) => {
	return instructions.map((i) => serializeInstruction(i)).join(' ');
};

export const serializeInstruction = (instruction: Instruction) => {
	if (instruction.type === 'M') {
		return `M ${instruction.x} ${instruction.y}`;
	}

	if (instruction.type === 'L') {
		return `L ${instruction.x} ${instruction.y}`;
	}

	if (instruction.type === 'C') {
		return `C ${instruction.cp1x} ${instruction.cp1y} ${instruction.cp2x} ${instruction.cp2y} ${instruction.x} ${instruction.y}`;
	}

	if (instruction.type === 'a') {
		return `a ${instruction.rx} ${instruction.ry} ${
			instruction.xAxisRotation
		} ${Number(instruction.largeArcFlag)} ${Number(
			instruction.sweepFlag ? 1 : 0
		)} ${instruction.x} ${instruction.y}`;
	}

	if (instruction.type === 'A') {
		return `A ${instruction.rx} ${instruction.ry} ${
			instruction.xAxisRotation
		} ${Number(instruction.largeArcFlag)} ${Number(
			instruction.sweepFlag ? 1 : 0
		)} ${instruction.x} ${instruction.y}`;
	}

	if (instruction.type === 'z') {
		return 'z';
	}

	throw new Error('not implemented');
};
