const {readFile, writeFile} = require('fs');

const COVERAGE_SUMMARY_PATH = './coverage/coverage-summary.json';
const OUTPUT_FILE = '../../TESTING.md';

const reportKeys = ['lines', 'statements', 'functions', 'branches'];

const getBadgeColor = (percentage) => {
	if (percentage < 70) return 'red';
	if (percentage < 85) return 'yellow';
	return 'brightgreen';
};

const getBadges = (report) => {
	const urls = {};
	reportKeys.forEach((key) => {
		const coverage = report.total[key].pct;
		urls[key] = `https://img.shields.io/badge/Coverage_${key}-${coverage}${encodeURI(
			'%'
		)}-${getBadgeColor(coverage)}.svg`;
	});
	return urls;
};

const replaceOldBadges = (oldFileAsString, newBadges) => {
	reportKeys.forEach((key) => {
		const regex = `!\\[${key}\\]\\([^\\)]*\\)`;
		oldFileAsString = oldFileAsString.replace(new RegExp(regex), `![${key}](${newBadges[key]})`);
	})
	return oldFileAsString
}

readFile(COVERAGE_SUMMARY_PATH, 'utf8', (errInput, resInput) => {
	if (errInput) {
		throw errInput;
	}

	const report = JSON.parse(resInput);
	const badges = getBadges(report);

	readFile(OUTPUT_FILE, 'utf8', (errOutput, resOutput) => {

		const newFile = replaceOldBadges(resOutput, badges);

		writeFile(OUTPUT_FILE, newFile, 'utf8', (writeError) => {
			if (writeError) {
				throw writeError;
			}
		});
	});
});
