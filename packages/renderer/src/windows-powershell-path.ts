/**
 * Escape a filesystem path for embedding inside a PowerShell single-quoted string.
 * In PowerShell, the only escape inside '...' is doubling apostrophes.
 */
export const escapePowerShellSingleQuoted = (value: string): string => {
	return value.replace(/'/g, "''");
};

/**
 * Build a Compress-Archive command that survives spaces, brackets, and
 * apostrophes in Windows paths (double-quoted -Path embedding does not).
 */
export const getCompressArchivePowerShellCommand = ({
	sourceFolder,
	targetZip,
}: {
	sourceFolder: string;
	targetZip: string;
}): string => {
	const source = escapePowerShellSingleQuoted(sourceFolder);
	const dest = escapePowerShellSingleQuoted(targetZip);
	return `Compress-Archive -Force -LiteralPath '${source}' -DestinationPath '${dest}'`;
};
