import {staticFile} from '../static-file';

test('Static file should correctly URL-encode filenames', () => {
	expect(staticFile('/file.mp4')).toBe('/file.mp4');
	expect(staticFile('file.mp4')).toBe('/file.mp4');
	expect(staticFile('file#.mp4')).toBe('/file%23.mp4');
	expect(staticFile('file%23.mp4')).toBe('/file%23.mp4');
	expect(staticFile('file%23/&.mp4')).toBe('/file%23/%26.mp4');
});
