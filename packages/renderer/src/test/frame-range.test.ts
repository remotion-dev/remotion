import {getFrameToRender} from '../get-frame-to-render';

test('Should parse the frame range at least', () => {
	expect(getFrameToRender(null, 0)).toBe(0);
	expect(getFrameToRender(0, 0)).toBe(0);
	expect(getFrameToRender([0, 150], 0)).toBe(0);
});
