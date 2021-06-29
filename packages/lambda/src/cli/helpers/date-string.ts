export const dateString = (date: Date) =>
	date.getFullYear() +
	'-' +
	String(date.getMonth() + 1).padEnd(2, '0') +
	'-' +
	String(date.getDate()).padEnd(2, '0');
