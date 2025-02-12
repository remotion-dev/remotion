/*
  @license
	Rollup.js v4.34.0
	Sat, 01 Feb 2025 08:39:54 GMT - commit 979d62888dbe75f92e50fdd64246c737c52f5f1f

	https://github.com/rollup/rollup

	Released under the MIT License.
*/
'use strict';

Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const getLogFilter = filters => {
    if (filters.length === 0)
        return () => true;
    const normalizedFilters = filters.map(filter => filter.split('&').map(subFilter => {
        const inverted = subFilter.startsWith('!');
        if (inverted)
            subFilter = subFilter.slice(1);
        const [key, ...value] = subFilter.split(':');
        return { inverted, key: key.split('.'), parts: value.join(':').split('*') };
    }));
    return (log) => {
        nextIntersectedFilter: for (const intersectedFilters of normalizedFilters) {
            for (const { inverted, key, parts } of intersectedFilters) {
                const isFilterSatisfied = testFilter(log, key, parts);
                if (inverted ? isFilterSatisfied : !isFilterSatisfied) {
                    continue nextIntersectedFilter;
                }
            }
            return true;
        }
        return false;
    };
};
const testFilter = (log, key, parts) => {
    let rawValue = log;
    for (let index = 0; index < key.length; index++) {
        if (!rawValue) {
            return false;
        }
        const part = key[index];
        if (!(part in rawValue)) {
            return false;
        }
        rawValue = rawValue[part];
    }
    let value = typeof rawValue === 'object' ? JSON.stringify(rawValue) : String(rawValue);
    if (parts.length === 1) {
        return value === parts[0];
    }
    if (!value.startsWith(parts[0])) {
        return false;
    }
    const lastPartIndex = parts.length - 1;
    for (let index = 1; index < lastPartIndex; index++) {
        const part = parts[index];
        const position = value.indexOf(part);
        if (position === -1) {
            return false;
        }
        value = value.slice(position + part.length);
    }
    return value.endsWith(parts[lastPartIndex]);
};

exports.getLogFilter = getLogFilter;
//# sourceMappingURL=getLogFilter.js.map
