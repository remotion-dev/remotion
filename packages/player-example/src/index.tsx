import {render} from 'react-dom';
import {registerRoot} from 'remotion';
import App from './App';
import RemotionVideo from './RemotionVideo';

registerRoot(RemotionVideo);

const rootElement = document.getElementById('root');

render(<App />, rootElement);
