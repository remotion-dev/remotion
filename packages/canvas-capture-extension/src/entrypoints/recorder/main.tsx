import {createRoot} from 'react-dom/client';
import {App} from './App';
import './style.css';

const root = document.getElementById('root');

if (root === null) {
	throw new Error('Missing recorder root element.');
}

createRoot(root).render(<App />);
