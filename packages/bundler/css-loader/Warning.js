/**
 * Forked from css-loader v5.2.7
 * MIT License http://www.opensource.org/licenses/mit-license.php
 */
"use strict";

class Warning extends Error {
	constructor(warning) {
		super(warning);
		const {text, line, column} = warning;
		this.name = "Warning";

		this.message = `${this.name}\n\n`;

		if (typeof line !== "undefined") {
			this.message += `(${line}:${column}) `;
		}

		this.message += `${text}`;

		this.stack = false;
	}
}

module.exports = Warning;
