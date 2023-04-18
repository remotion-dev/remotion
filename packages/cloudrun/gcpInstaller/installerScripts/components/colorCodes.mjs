/****************************************
 * Text colours codes
 ****************************************/
const resetText = '\u001b[0m';
const greenText = `${resetText}\u001b[32;1m`;
const blueText = `${resetText}\u001b[34;1m`;
const redText = `${resetText}\u001b[31;1m`;
const redBackground = `${resetText}\u001b[41;1m`;
const greenBackground = `${resetText}\u001b[42;1m`;
const blueBackground = `${resetText}\u001b[44;1m`;

export const colorCode = {
	resetText,
	greenText,
	blueText,
	redText,
	redBackground,
	greenBackground,
	blueBackground,
};
