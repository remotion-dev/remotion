const errorMessage =
  "Don't throw @remotion/google-fonts directly. Instead, import a font directly: `import {loadFont} from '@remotion/google-fonts/Roboto'`";

export default () => {
  throw new TypeError(errorMessage);
};

export const dontImportTheMainPackageImportUsingASlashInstead = () => {
  throw new TypeError(errorMessage);
};
