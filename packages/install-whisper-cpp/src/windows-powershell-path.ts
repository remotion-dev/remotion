/**
 * Escape a filesystem path for embedding inside a PowerShell single-quoted string.
 * In PowerShell, the only escape inside '...' is doubling apostrophes.
 */
export const escapePowerShellSingleQuoted = (value: string): string => {
	return value.replace(/'/g, "''");
};

/**
 * Build an Expand-Archive command that survives spaces, brackets, and
 * apostrophes in Windows paths. Passing Expand-Archive through
 * `spawn(..., {shell: 'powershell'})` concatenates args without quoting, so
 * paths like `C:\Users\O'Brien\...` or `C:\Users\Jane Doe\...` break.
 */
export const getExpandArchivePowerShellCommand = ({
	zipPath,
	destDir,
}: {
	zipPath: string;
	destDir: string;
}): string => {
	const zip = escapePowerShellSingleQuoted(zipPath);
	const dest = escapePowerShellSingleQuoted(destDir);
	return `Expand-Archive -Force -LiteralPath '${zip}' -DestinationPath '${dest}'`;
};
