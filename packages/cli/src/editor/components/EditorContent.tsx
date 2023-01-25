import React from 'react';
import {useIsStill} from '../helpers/is-current-selected-still';
import {SplitterContainer} from './Splitter/SplitterContainer';
import {SplitterElement} from './Splitter/SplitterElement';
import {SplitterHandle} from './Splitter/SplitterHandle';
import {Timeline} from './Timeline/Timeline';
import {TopPanel} from './TopPanel';

const noop = () => undefined;

export const EditorContent: React.FC = () => {
	const isStill = useIsStill();

	if (isStill) {
		return <TopPanel />;
	}

	return (
		<SplitterContainer
			orientation="horizontal"
			id="top-to-bottom"
			maxFlex={0.9}
			minFlex={0.2}
			defaultFlex={0.75}
		>
			<SplitterElement type="flexer">
				<TopPanel />
			</SplitterElement>
			<SplitterHandle allowToCollapse={false} onCollapse={noop} />
			<SplitterElement type="anti-flexer">
				<Timeline />
			</SplitterElement>
		</SplitterContainer>
	);
};
