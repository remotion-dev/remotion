import {TimingEditor} from '~/components/timing-editor';
import {TitleProvider} from '~/lib/title-context';
import type {RouteAction} from '~/seo';

const routeAction: RouteAction = {
	type: 'timing-editor',
};

const SpringEditorPage = () => {
	return (
		<TitleProvider routeAction={routeAction}>
			<TimingEditor />
		</TitleProvider>
	);
};

export default SpringEditorPage;
