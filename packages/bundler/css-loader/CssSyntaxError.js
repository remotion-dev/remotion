/**
 * Forked from css-loader v5.2.7
 * MIT License http://www.opensource.org/licenses/mit-license.php
 */
"use strict";

class CssSyntaxError extends Error {
	constructor(error) {
		super(error);
		const {reason, line, column, file} = error;
		this.name = "CssSyntaxError";

		this.message = `${this.name}\n\n`;

		if (typeof line !== "undefined") {
			this.message += `(${line}:${column}) `;
		}

		this.message += file ? `${file} ` : "<css input> ";
		this.message += `${reason}`;
		const code = error.showSourceCode();

		if (code) {
			this.message += `\n\n${code}\n`;
		}

		this.stack = false;
	}
}

module.exports = CssSyntaxError;
