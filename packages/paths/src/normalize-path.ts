/**
 * Removes all relative coordinates from an SVG path and converts them into absolute coordinates.
 * @param {string} path A valid SVG path
 * @link https://remotion.dev/docs/paths/normalize-path
 */
export const normalizePath = (path: string) => {
	// preprocess "d" so that we have spaces between values
	path = path
		.replace(/,/g, ' ')
		.replace(/([^eE])-/g, '$1 -')
		.replace(/\s*([achlmqstvzACHLMQSTVZ])\s*/g, ' $1 ')
		.replace(/\s+/g, ' ');

	// set up the variables used in this function
	const instructions = path
		.replace(/([achlmqstvzACHLMQSTVZ])\s?/g, '|$1')
		.split('|');
	const instructionLength = instructions.length;
	let i;
	let instruction;
	let op;
	let lop;
	let alen;
	let a;
	let sx = 0;
	let sy = 0;
	let x = 0;
	let y = 0;
	let cx = 0;
	let cy = 0;
	let cx2 = 0;
	let cy2 = 0;
	let rx = 0;
	let ry = 0;
	let xrot = 0;
	let lflag: string | number = 0;
	let sweep: string | number = 0;
	let normalized = '';

	// we run through the instruction list starting at 1, not 0,
	// because we split up "|M x y ...." so the first element will
	// always be an empty string. By design.
	for (i = 1; i < instructionLength; i++) {
		// which instruction is this?
		instruction = instructions[i];
		op = instruction.substring(0, 1);
		lop = op.toLowerCase();

		// what are the arguments? note that we need to convert
		// all strings into numbers, or + will do silly things.
		const oargs = instruction
			.replace(op, '')
			.trim()
			.split(' ')
			.filter((v) => {
				return v !== '';
			});
		const args = oargs.map((_a) => parseFloat(String(_a)));
		alen = args.length;

		// we could use a switch, but elaborate code in a "case" with
		// fallthrough is just horrid to read. So let's use ifthen
		// statements instead.

		// moveto command (plus possible lineto)
		if (lop === 'm') {
			normalized += 'M ';
			if (op === 'm') {
				x += args[0];
				y += args[1];
			} else {
				x = args[0];
				y = args[1];
			}

			// records start position, for dealing
			// with the shape close operator ('Z')
			sx = x;
			sy = y;
			normalized += x + ' ' + y + ' ';
			if (alen > 2) {
				for (a = 0; a < alen; a += 2) {
					// eslint-disable-next-line max-depth
					if (op === 'm') {
						x += args[a];
						y += args[a + 1];
					} else {
						x = args[a];
						y = args[a + 1];
					}

					normalized += 'L ' + x + ' ' + y + ' ';
				}
			}
		}

		// lineto commands
		else if (lop === 'l') {
			for (a = 0; a < alen; a += 2) {
				if (op === 'l') {
					x += args[a];
					y += args[a + 1];
				} else {
					x = args[a];
					y = args[a + 1];
				}

				normalized += 'L ' + x + ' ' + y + ' ';
			}
		} else if (lop === 'h') {
			for (a = 0; a < alen; a++) {
				if (op === 'h') {
					x += args[a];
				} else {
					x = args[a];
				}

				normalized += 'L ' + x + ' ' + y + ' ';
			}
		} else if (lop === 'v') {
			for (a = 0; a < alen; a++) {
				if (op === 'v') {
					y += args[a];
				} else {
					y = args[a];
				}

				normalized += 'L ' + x + ' ' + y + ' ';
			}
		}

		// quadratic curveto commands
		else if (lop === 'q') {
			for (a = 0; a < alen; a += 4) {
				if (op === 'q') {
					cx = x + args[a];
					cy = y + args[a + 1];
					x += args[a + 2];
					y += args[a + 3];
				} else {
					cx = args[a];
					cy = args[a + 1];
					x = args[a + 2];
					y = args[a + 3];
				}

				normalized += 'Q ' + cx + ' ' + cy + ' ' + x + ' ' + y + ' ';
			}
		} else if (lop === 't') {
			for (a = 0; a < alen; a += 2) {
				// reflect previous cx/cy over x/y
				cx = x + (x - cx);
				cy = y + (y - cy);
				// then get real end point
				if (op === 't') {
					x += args[a];
					y += args[a + 1];
				} else {
					x = args[a];
					y = args[a + 1];
				}

				normalized += 'Q ' + cx + ' ' + cy + ' ' + x + ' ' + y + ' ';
			}
		}

		// cubic curveto commands
		else if (lop === 'c') {
			for (a = 0; a < alen; a += 6) {
				if (op === 'c') {
					cx = x + args[a];
					cy = y + args[a + 1];
					cx2 = x + args[a + 2];
					cy2 = y + args[a + 3];
					x += args[a + 4];
					y += args[a + 5];
				} else {
					cx = args[a];
					cy = args[a + 1];
					cx2 = args[a + 2];
					cy2 = args[a + 3];
					x = args[a + 4];
					y = args[a + 5];
				}

				normalized +=
					'C ' +
					cx +
					' ' +
					cy +
					' ' +
					cx2 +
					' ' +
					cy2 +
					' ' +
					x +
					' ' +
					y +
					' ';
			}
		} else if (lop === 's') {
			for (a = 0; a < alen; a += 4) {
				// reflect previous cx2/cy2 over x/y
				cx = x + (x - cx2);
				cy = y + (y - cy2);
				// then get real control and end point
				if (op === 's') {
					cx2 = x + args[a];
					cy2 = y + args[a + 1];
					x += args[a + 2];
					y += args[a + 3];
				} else {
					cx2 = args[a];
					cy2 = args[a + 1];
					x = args[a + 2];
					y = args[a + 3];
				}

				normalized +=
					'C ' +
					cx +
					' ' +
					cy +
					' ' +
					cx2 +
					' ' +
					cy2 +
					' ' +
					x +
					' ' +
					y +
					' ';
			}
		}

		//   rx ry x-axis-rotation large-arc-flag sweep-flag  x   y
		// a 25,25             -30              0,         1 50,-25

		// arc command
		else if (lop === 'a') {
			for (a = 0; a < alen; a += 7) {
				rx = args[a];
				ry = args[a + 1];
				xrot = args[a + 2];

				lflag = oargs[a + 3]; // we need the original string to deal with leading zeroes
				let fixed = false;

				if (lflag.length > 1) {
					const b1 = parseInt(lflag[0], 10);
					const b2 = parseInt(lflag[1], 10);
					let rest;
					// eslint-disable-next-line max-depth
					if (lflag.length > 2) rest = parseFloat(lflag.substring(2));
					args[a + 3] = b1;
					args.splice(a + 4, 0, b2);
					// eslint-disable-next-line max-depth
					if (rest !== undefined) args.splice(a + 5, 0, rest);
					fixed = true;
				}

				lflag = args[a + 3];

				sweep = fixed ? args[a + 4] : oargs[a + 4]; // we need the original string to deal with leading zeroes
				if (!fixed && (sweep as string).length > 1) {
					args[a + 4] = parseInt((sweep as string)[0], 10);
					args.splice(a + 5, 0, parseFloat((sweep as string).substring(1)));
				}

				sweep = args[a + 4];

				if (op === 'a') {
					x += args[a + 5];
					y += args[a + 6];
				} else {
					x = args[a + 5];
					y = args[a + 6];
				}

				normalized +=
					'A ' +
					rx +
					' ' +
					ry +
					' ' +
					xrot +
					' ' +
					lflag +
					' ' +
					sweep +
					' ' +
					x +
					' ' +
					y +
					' ';
			}
		} else if (lop === 'z') {
			normalized += 'Z ';
			// not unimportant: path closing changes the current x/y coordinate
			x = sx;
			y = sy;
		}
	}

	return normalized.trim();
};
