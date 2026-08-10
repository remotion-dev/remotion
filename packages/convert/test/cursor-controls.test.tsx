import {afterEach, expect, test} from 'bun:test';
import {cleanup, fireEvent, render} from '@testing-library/react';
import React, {useState} from 'react';
import {CursorControls} from '../app/components/CursorControls';

afterEach(() => cleanup());

const CursorControlsFixture: React.FC<{readonly available: boolean}> = ({
	available,
}) => {
	const [showCursor, setShowCursor] = useState(true);
	const [cursorScale, setCursorScale] = useState(1);

	return (
		<CursorControls
			available={available}
			showCursor={showCursor}
			setShowCursor={setShowCursor}
			cursorScale={cursorScale}
			setCursorScale={setCursorScale}
		/>
	);
};

test('only offers enabled cursor controls for canvas captures', () => {
	const rendered = render(<CursorControlsFixture available={false} />);
	expect(rendered.queryByRole('switch', {name: 'Show cursor'})).toBeNull();

	rendered.rerender(<CursorControlsFixture available />);
	const showCursor = rendered.getByRole('switch', {name: 'Show cursor'});
	expect(showCursor.getAttribute('aria-checked')).toBe('true');
	const cursorScale = rendered.getByRole('slider', {name: 'Cursor scale'});
	expect(rendered.getByText('1.00×')).not.toBeNull();
	fireEvent.keyDown(cursorScale, {key: 'ArrowRight'});
	expect(rendered.getByText('1.05×')).not.toBeNull();

	fireEvent.click(showCursor);
	expect(showCursor.getAttribute('aria-checked')).toBe('false');
	expect(rendered.queryByRole('slider', {name: 'Cursor scale'})).toBeNull();
});
