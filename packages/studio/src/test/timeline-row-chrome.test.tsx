import {afterEach, expect, test} from 'bun:test';
import React, {act} from 'react';
import {createRoot, type Root} from 'react-dom/client';
import '../../../core/happydom';
import {TimelineRowChrome} from '../components/Timeline/TimelineRowChrome';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement | null = null;
let root: Root | null = null;

afterEach(() => {
	if (root) {
		act(() => {
			root?.unmount();
		});
	}

	container?.remove();
	root = null;
	container = null;
});

test('TimelineRowChrome selects on pointer down before inner controls stop propagation', () => {
	const interactions: Array<{shiftKey: boolean; toggleKey: boolean}> = [];
	container = document.createElement('div');
	document.body.appendChild(container);
	root = createRoot(container);

	act(() => {
		root?.render(
			<TimelineRowChrome
				depth={0}
				eye={null}
				arrow={null}
				style={{height: 24}}
				selected={false}
				selectable
				onSelect={(interaction) => {
					if (interaction) {
						interactions.push(interaction);
					}
				}}
				showSelectedBackground
				containsSelection={false}
				outerHeight={null}
			>
				<button
					type="button"
					onPointerDown={(event) => {
						event.stopPropagation();
					}}
				>
					Value control
				</button>
			</TimelineRowChrome>,
		);
	});

	const button = container.querySelector('button');
	expect(button).not.toBeNull();

	act(() => {
		button?.dispatchEvent(
			new PointerEvent('pointerdown', {button: 0, bubbles: true}),
		);
	});

	expect(interactions).toEqual([{shiftKey: false, toggleKey: false}]);
});
