import {expect, test} from 'bun:test';
import {
	filterStaticFilesByQuery,
	getExpandedFoldersForFilteredAssets,
} from '../helpers/filter-static-files';

test('filterStaticFilesByQuery returns all files for an empty query', () => {
	const files = [{name: 'logo.png'}, {name: 'audio/theme.mp3'}];

	expect(filterStaticFilesByQuery(files, '')).toEqual(files);
	expect(filterStaticFilesByQuery(files, '   ')).toEqual(files);
});

test('filterStaticFilesByQuery matches path segments case-insensitively', () => {
	const files = [
		{name: 'logo.png'},
		{name: 'audio/Theme.mp3'},
		{name: 'images/hero/Logo.webp'},
	];

	expect(
		filterStaticFilesByQuery(files, 'logo').map((file) => file.name),
	).toEqual(['logo.png', 'images/hero/Logo.webp']);
	expect(
		filterStaticFilesByQuery(files, 'THEME').map((file) => file.name),
	).toEqual(['audio/Theme.mp3']);
});

test('getExpandedFoldersForFilteredAssets expands every ancestor folder', () => {
	expect(
		getExpandedFoldersForFilteredAssets([
			{name: 'images/hero/Logo.webp'},
			{name: 'audio/Theme.mp3'},
			{name: 'root.png'},
		]),
	).toEqual({
		images: true,
		'images/hero': true,
		audio: true,
	});
});
