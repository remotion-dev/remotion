import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Bitcount Prop Single Ink',
	importName: 'BitcountPropSingleInk',
	version: 'v4',
	url: 'https://fonts.googleapis.com/css2?family=Bitcount+Prop+Single+Ink:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900',
	unicodeRanges: {
		'latin-ext':
			'U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		normal: {
			'100': {
				'latin-ext':
					'https://fonts.gstatic.com/s/bitcountpropsingleink/v4/wXI-GHRJhY4pqVPamSvcVZZF7Vdg3La14u9PlzzO1nQEbZPzF-4gWjUKyDXV8KJN2EmG9tnR1UwPVIktRU7KfRvK49YKhcKoqpd0qENrktXGo3hmFUX9oJiQ_cI3D53uhksE9rntl1PkS1IjdhAg77zMwnnLO7zJ5bZKR5MO8LRFFwWr-XrNplyw2CuD3tEnNissrzK7ZCnsz5HReNrx9tSOd7zVHA.woff2',
				latin:
					'https://fonts.gstatic.com/s/bitcountpropsingleink/v4/wXI-GHRJhY4pqVPamSvcVZZF7Vdg3La14u9PlzzO1nQEbZPzF-4gWjUKyDXV8KJN2EmG9tnR1UwPVIktRU7KfRvK49YKhcKoqpd0qENrktXGo3hmFUX9oJiQ_cI3D53uhksE9rntl1PkS1IjdhAg77zMwnnLO7zJ5bZKR5MO8LRFFwWr-XrNplyw2CuD3tEnNissrzK7ZCnsz5HReNrx9tSAd7w.woff2',
			},
			'200': {
				'latin-ext':
					'https://fonts.gstatic.com/s/bitcountpropsingleink/v4/wXI-GHRJhY4pqVPamSvcVZZF7Vdg3La14u9PlzzO1nQEbZPzF-4gWjUKyDXV8KJN2EmG9tnR1UwPVIktRU7KfRvK49YKhcKoqpd0qENrktXGo3hmFUX9oJiQ_cI3D53uhksE9rntl1PkS1IjdhAg77zMwnnLO7zJ5bZKR5MO8LRFFwWr-XrNplyw2CuD3tEnNissrzK7ZCnsz5HReNrx9tSOd7zVHA.woff2',
				latin:
					'https://fonts.gstatic.com/s/bitcountpropsingleink/v4/wXI-GHRJhY4pqVPamSvcVZZF7Vdg3La14u9PlzzO1nQEbZPzF-4gWjUKyDXV8KJN2EmG9tnR1UwPVIktRU7KfRvK49YKhcKoqpd0qENrktXGo3hmFUX9oJiQ_cI3D53uhksE9rntl1PkS1IjdhAg77zMwnnLO7zJ5bZKR5MO8LRFFwWr-XrNplyw2CuD3tEnNissrzK7ZCnsz5HReNrx9tSAd7w.woff2',
			},
			'300': {
				'latin-ext':
					'https://fonts.gstatic.com/s/bitcountpropsingleink/v4/wXI-GHRJhY4pqVPamSvcVZZF7Vdg3La14u9PlzzO1nQEbZPzF-4gWjUKyDXV8KJN2EmG9tnR1UwPVIktRU7KfRvK49YKhcKoqpd0qENrktXGo3hmFUX9oJiQ_cI3D53uhksE9rntl1PkS1IjdhAg77zMwnnLO7zJ5bZKR5MO8LRFFwWr-XrNplyw2CuD3tEnNissrzK7ZCnsz5HReNrx9tSOd7zVHA.woff2',
				latin:
					'https://fonts.gstatic.com/s/bitcountpropsingleink/v4/wXI-GHRJhY4pqVPamSvcVZZF7Vdg3La14u9PlzzO1nQEbZPzF-4gWjUKyDXV8KJN2EmG9tnR1UwPVIktRU7KfRvK49YKhcKoqpd0qENrktXGo3hmFUX9oJiQ_cI3D53uhksE9rntl1PkS1IjdhAg77zMwnnLO7zJ5bZKR5MO8LRFFwWr-XrNplyw2CuD3tEnNissrzK7ZCnsz5HReNrx9tSAd7w.woff2',
			},
			'400': {
				'latin-ext':
					'https://fonts.gstatic.com/s/bitcountpropsingleink/v4/wXI-GHRJhY4pqVPamSvcVZZF7Vdg3La14u9PlzzO1nQEbZPzF-4gWjUKyDXV8KJN2EmG9tnR1UwPVIktRU7KfRvK49YKhcKoqpd0qENrktXGo3hmFUX9oJiQ_cI3D53uhksE9rntl1PkS1IjdhAg77zMwnnLO7zJ5bZKR5MO8LRFFwWr-XrNplyw2CuD3tEnNissrzK7ZCnsz5HReNrx9tSOd7zVHA.woff2',
				latin:
					'https://fonts.gstatic.com/s/bitcountpropsingleink/v4/wXI-GHRJhY4pqVPamSvcVZZF7Vdg3La14u9PlzzO1nQEbZPzF-4gWjUKyDXV8KJN2EmG9tnR1UwPVIktRU7KfRvK49YKhcKoqpd0qENrktXGo3hmFUX9oJiQ_cI3D53uhksE9rntl1PkS1IjdhAg77zMwnnLO7zJ5bZKR5MO8LRFFwWr-XrNplyw2CuD3tEnNissrzK7ZCnsz5HReNrx9tSAd7w.woff2',
			},
			'500': {
				'latin-ext':
					'https://fonts.gstatic.com/s/bitcountpropsingleink/v4/wXI-GHRJhY4pqVPamSvcVZZF7Vdg3La14u9PlzzO1nQEbZPzF-4gWjUKyDXV8KJN2EmG9tnR1UwPVIktRU7KfRvK49YKhcKoqpd0qENrktXGo3hmFUX9oJiQ_cI3D53uhksE9rntl1PkS1IjdhAg77zMwnnLO7zJ5bZKR5MO8LRFFwWr-XrNplyw2CuD3tEnNissrzK7ZCnsz5HReNrx9tSOd7zVHA.woff2',
				latin:
					'https://fonts.gstatic.com/s/bitcountpropsingleink/v4/wXI-GHRJhY4pqVPamSvcVZZF7Vdg3La14u9PlzzO1nQEbZPzF-4gWjUKyDXV8KJN2EmG9tnR1UwPVIktRU7KfRvK49YKhcKoqpd0qENrktXGo3hmFUX9oJiQ_cI3D53uhksE9rntl1PkS1IjdhAg77zMwnnLO7zJ5bZKR5MO8LRFFwWr-XrNplyw2CuD3tEnNissrzK7ZCnsz5HReNrx9tSAd7w.woff2',
			},
			'600': {
				'latin-ext':
					'https://fonts.gstatic.com/s/bitcountpropsingleink/v4/wXI-GHRJhY4pqVPamSvcVZZF7Vdg3La14u9PlzzO1nQEbZPzF-4gWjUKyDXV8KJN2EmG9tnR1UwPVIktRU7KfRvK49YKhcKoqpd0qENrktXGo3hmFUX9oJiQ_cI3D53uhksE9rntl1PkS1IjdhAg77zMwnnLO7zJ5bZKR5MO8LRFFwWr-XrNplyw2CuD3tEnNissrzK7ZCnsz5HReNrx9tSOd7zVHA.woff2',
				latin:
					'https://fonts.gstatic.com/s/bitcountpropsingleink/v4/wXI-GHRJhY4pqVPamSvcVZZF7Vdg3La14u9PlzzO1nQEbZPzF-4gWjUKyDXV8KJN2EmG9tnR1UwPVIktRU7KfRvK49YKhcKoqpd0qENrktXGo3hmFUX9oJiQ_cI3D53uhksE9rntl1PkS1IjdhAg77zMwnnLO7zJ5bZKR5MO8LRFFwWr-XrNplyw2CuD3tEnNissrzK7ZCnsz5HReNrx9tSAd7w.woff2',
			},
			'700': {
				'latin-ext':
					'https://fonts.gstatic.com/s/bitcountpropsingleink/v4/wXI-GHRJhY4pqVPamSvcVZZF7Vdg3La14u9PlzzO1nQEbZPzF-4gWjUKyDXV8KJN2EmG9tnR1UwPVIktRU7KfRvK49YKhcKoqpd0qENrktXGo3hmFUX9oJiQ_cI3D53uhksE9rntl1PkS1IjdhAg77zMwnnLO7zJ5bZKR5MO8LRFFwWr-XrNplyw2CuD3tEnNissrzK7ZCnsz5HReNrx9tSOd7zVHA.woff2',
				latin:
					'https://fonts.gstatic.com/s/bitcountpropsingleink/v4/wXI-GHRJhY4pqVPamSvcVZZF7Vdg3La14u9PlzzO1nQEbZPzF-4gWjUKyDXV8KJN2EmG9tnR1UwPVIktRU7KfRvK49YKhcKoqpd0qENrktXGo3hmFUX9oJiQ_cI3D53uhksE9rntl1PkS1IjdhAg77zMwnnLO7zJ5bZKR5MO8LRFFwWr-XrNplyw2CuD3tEnNissrzK7ZCnsz5HReNrx9tSAd7w.woff2',
			},
			'800': {
				'latin-ext':
					'https://fonts.gstatic.com/s/bitcountpropsingleink/v4/wXI-GHRJhY4pqVPamSvcVZZF7Vdg3La14u9PlzzO1nQEbZPzF-4gWjUKyDXV8KJN2EmG9tnR1UwPVIktRU7KfRvK49YKhcKoqpd0qENrktXGo3hmFUX9oJiQ_cI3D53uhksE9rntl1PkS1IjdhAg77zMwnnLO7zJ5bZKR5MO8LRFFwWr-XrNplyw2CuD3tEnNissrzK7ZCnsz5HReNrx9tSOd7zVHA.woff2',
				latin:
					'https://fonts.gstatic.com/s/bitcountpropsingleink/v4/wXI-GHRJhY4pqVPamSvcVZZF7Vdg3La14u9PlzzO1nQEbZPzF-4gWjUKyDXV8KJN2EmG9tnR1UwPVIktRU7KfRvK49YKhcKoqpd0qENrktXGo3hmFUX9oJiQ_cI3D53uhksE9rntl1PkS1IjdhAg77zMwnnLO7zJ5bZKR5MO8LRFFwWr-XrNplyw2CuD3tEnNissrzK7ZCnsz5HReNrx9tSAd7w.woff2',
			},
			'900': {
				'latin-ext':
					'https://fonts.gstatic.com/s/bitcountpropsingleink/v4/wXI-GHRJhY4pqVPamSvcVZZF7Vdg3La14u9PlzzO1nQEbZPzF-4gWjUKyDXV8KJN2EmG9tnR1UwPVIktRU7KfRvK49YKhcKoqpd0qENrktXGo3hmFUX9oJiQ_cI3D53uhksE9rntl1PkS1IjdhAg77zMwnnLO7zJ5bZKR5MO8LRFFwWr-XrNplyw2CuD3tEnNissrzK7ZCnsz5HReNrx9tSOd7zVHA.woff2',
				latin:
					'https://fonts.gstatic.com/s/bitcountpropsingleink/v4/wXI-GHRJhY4pqVPamSvcVZZF7Vdg3La14u9PlzzO1nQEbZPzF-4gWjUKyDXV8KJN2EmG9tnR1UwPVIktRU7KfRvK49YKhcKoqpd0qENrktXGo3hmFUX9oJiQ_cI3D53uhksE9rntl1PkS1IjdhAg77zMwnnLO7zJ5bZKR5MO8LRFFwWr-XrNplyw2CuD3tEnNissrzK7ZCnsz5HReNrx9tSAd7w.woff2',
			},
		},
	},
	subsets: ['latin', 'latin-ext'],
});

export const fontFamily = 'Bitcount Prop Single Ink' as const;

type Variants = {
	normal: {
		weights:
			| '100'
			| '200'
			| '300'
			| '400'
			| '500'
			| '600'
			| '700'
			| '800'
			| '900';
		subsets: 'latin' | 'latin-ext';
	};
};

export const loadFont = <T extends keyof Variants>(
	style?: T,
	options?: {
		weights?: Variants[T]['weights'][];
		subsets?: Variants[T]['subsets'][];
		document?: Document;
		ignoreTooManyRequestsWarning?: boolean;
	},
) => {
	return loadFonts(getInfo(), style, options);
};
