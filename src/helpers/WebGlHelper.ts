import { BaseTHREEHelper } from "./BaseTHREEHelper";

export abstract class WebGlHelper extends BaseTHREEHelper {
    protected _isWebgl2: boolean;

    constructor(stack, isWebgl2) {
        super(stack);

        this._isWebgl2 = isWebgl2;
    }

    protected abstract _init();
    protected abstract _create();
}