/*

Copied and adapted from https://github.com/pbeshai/d3-interpolate-path:
Copyright 2016, Peter Beshai
All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice, this
  list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice,
  this list of conditions and the following disclaimer in the documentation
  and/or other materials provided with the distribution.

* Neither the name of the author nor the names of contributors may be used to
  endorse or promote products derived from this software without specific prior
  written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

*/

import {parsePath} from '../parse-path';
import {reduceInstructions} from '../reduce-instructions';
import {serializeInstructions} from '../serialize-instructions';
import {interpolateInstructions} from './interpolate-instructions';

/*
 * @description Interpolates between two SVG paths based on the provided value, transitioning from the first path to the second.
 * @see [Documentation](https://www.remotion.dev/docs/paths/interpolate-path)
 */
export const interpolatePath = (
	value: number,
	firstPath: string,
	secondPath: string,
) => {
	// at 1 return the final value without the extensions used during interpolation
	if (value === 1) {
		return secondPath;
	}

	if (value === 0) {
		return firstPath;
	}

	const aCommands = reduceInstructions(parsePath(firstPath));
	if (aCommands.length === 0) {
		throw new TypeError(`SVG Path "${firstPath}" is not valid`);
	}

	const bCommands = reduceInstructions(parsePath(secondPath));
	if (bCommands.length === 0) {
		throw new TypeError(`SVG Path "${secondPath}" is not valid`);
	}

	const commandInterpolator = interpolateInstructions(aCommands, bCommands);

	return serializeInstructions(commandInterpolator(value));
};
