export function is_chinese_char(cp: number) {
	return (
		(cp >= 0x4e00 && cp <= 0x9fff) ||
		(cp >= 0x3400 && cp <= 0x4dbf) ||
		(cp >= 0x20000 && cp <= 0x2a6df) ||
		(cp >= 0x2a700 && cp <= 0x2b73f) ||
		(cp >= 0x2b740 && cp <= 0x2b81f) ||
		(cp >= 0x2b820 && cp <= 0x2ceaf) ||
		(cp >= 0xf900 && cp <= 0xfaff) ||
		(cp >= 0x2f800 && cp <= 0x2fa1f)
	);
}
