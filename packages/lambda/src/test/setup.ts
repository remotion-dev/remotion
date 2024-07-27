import {vi} from 'vitest';

vi.mock('../cli/helpers/quit', () =>
	vi.importActual('../cli/helpers/__mocks__/quit'),
);
vi.mock('../functions/helpers/io', () =>
	vi.importActual('../functions/helpers/__mocks__/io'),
);
vi.mock('../functions/helpers/timer', () =>
	vi.importActual('../functions/helpers/__mocks__/timer'),
);
vi.mock('../functions/helpers/get-browser-instance', () =>
	vi.importActual('../functions/helpers/__mocks__/get-browser-instance'),
);
vi.mock('../functions/helpers/leak-detection', () =>
	vi.importActual('../functions/helpers/__mocks__/leak-detection'),
);
vi.mock('../shared/bundle-site', () =>
	vi.importActual('../shared/__mocks__/bundle-site'),
);
vi.mock('../shared/get-account-id', () =>
	vi.importActual('../shared/__mocks__/get-account-id'),
);
vi.mock('../shared/aws-clients', () =>
	vi.importActual('../shared/__mocks__/aws-clients'),
);
vi.mock('../shared/read-dir', () =>
	vi.importActual('../shared/__mocks__/read-dir'),
);
vi.mock('../api/upload-dir', () =>
	vi.importActual('../api/__mocks__/upload-dir'),
);
vi.mock('../api/clean-items', () =>
	vi.importActual('../api/__mocks__/clean-items'),
);
vi.mock('../api/create-function', () =>
	vi.importActual('../api/__mocks__/create-function'),
);
vi.mock('../api/get-functions', () =>
	vi.importActual('../api/__mocks__/get-functions'),
);
vi.mock('../api/delete-function', () =>
	vi.importActual('../api/__mocks__/delete-function'),
);
vi.mock('../shared/check-credentials', () =>
	vi.importActual('../shared/__mocks__/check-credentials'),
);
