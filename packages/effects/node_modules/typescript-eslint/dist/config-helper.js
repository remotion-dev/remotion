"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = config;
/**
 * Utility function to make it easy to strictly type your "Flat" config file
 * @example
 * ```js
 * // @ts-check
 *
 * import eslint from '@eslint/js';
 * import tseslint from 'typescript-eslint';
 *
 * export default tseslint.config(
 *   eslint.configs.recommended,
 *   tseslint.configs.recommended,
 *   {
 *     rules: {
 *       '@typescript-eslint/array-type': 'error',
 *     },
 *   },
 * );
 * ```
 */
function config(...configs) {
    const flattened = 
    // @ts-expect-error -- intentionally an infinite type
    configs.flat(Infinity);
    return flattened.flatMap((configWithExtends, configIndex) => {
        const { extends: extendsArr, ...config } = configWithExtends;
        if (extendsArr == null || extendsArr.length === 0) {
            return config;
        }
        const extendsArrFlattened = extendsArr.flat(Infinity);
        const undefinedExtensions = extendsArrFlattened.reduce((acc, extension, extensionIndex) => {
            const maybeExtension = extension;
            if (maybeExtension == null) {
                acc.push(extensionIndex);
            }
            return acc;
        }, []);
        if (undefinedExtensions.length) {
            const configName = configWithExtends.name != null
                ? `, named "${configWithExtends.name}",`
                : ' (anonymous)';
            const extensionIndices = undefinedExtensions.join(', ');
            throw new Error(`Your config at index ${configIndex}${configName} contains undefined` +
                ` extensions at the following indices: ${extensionIndices}.`);
        }
        return [
            ...extendsArrFlattened.map(extension => {
                const name = [config.name, extension.name].filter(Boolean).join('__');
                return {
                    ...extension,
                    ...(config.files && { files: config.files }),
                    ...(config.ignores && { ignores: config.ignores }),
                    ...(name && { name }),
                };
            }),
            config,
        ];
    });
}
//# sourceMappingURL=config-helper.js.map