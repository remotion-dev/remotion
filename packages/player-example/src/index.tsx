import {render} from 'react-dom';
import App from './App';

const rootElement = document.getElementById('root');

render(
	<div style={{display: 'flex', flexDirection: 'row', flexWrap:"wrap", justifyContent:"center"}}>
		<App />
		<App />
	</div>,
	rootElement
);
