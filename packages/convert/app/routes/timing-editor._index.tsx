import {TitleProvider} from '~/lib/title-context';
import type {RouteAction} from '~/seo';

const routeAction: RouteAction = {
	type: 'timing-editor',
};

const TimingEditorPage = () => {
	return (
		<TitleProvider routeAction={routeAction}>
			<main className="flex min-h-screen items-center justify-center p-4 text-center">
				<p>
					Timings can now be edited in the Remotion Studio, and we will put our
					focus on improving it.
					<br />
					The standalone timing editor is now discontinued.
				</p>
			</main>
		</TitleProvider>
	);
};

export default TimingEditorPage;
