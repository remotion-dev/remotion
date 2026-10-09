import {GlobalRegistrator} from '@happy-dom/global-registrator';

if (typeof document === 'undefined') {
	GlobalRegistrator.register({url: 'http://localhost:3000'});
}
