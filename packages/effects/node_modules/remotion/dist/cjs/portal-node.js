"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.portalNode = void 0;
let _portalNode = null;
const portalNode = () => {
    if (!_portalNode) {
        if (typeof document === 'undefined') {
            throw new Error('Tried to call an API that only works in the browser from outside the browser');
        }
        _portalNode = document.createElement('div');
        _portalNode.style.position = 'absolute';
        _portalNode.style.top = '0px';
        _portalNode.style.left = '0px';
        _portalNode.style.right = '0px';
        _portalNode.style.bottom = '0px';
        _portalNode.style.width = '100%';
        _portalNode.style.height = '100%';
        _portalNode.style.display = 'flex';
        _portalNode.style.flexDirection = 'column';
        const containerNode = document.createElement('div');
        containerNode.style.position = 'fixed';
        containerNode.style.top = -999999 + 'px';
        containerNode.appendChild(_portalNode);
        document.body.appendChild(containerNode);
    }
    return _portalNode;
};
exports.portalNode = portalNode;
