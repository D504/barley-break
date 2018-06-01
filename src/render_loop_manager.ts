const DO_NOTHING = () => {};

// Sorry for the next code.
// I just tried to create RenderLoopManager which can be used in sync style.
// Just for fun. But it seems unusable. :-(
// TODO: add JSDoc comments for methods

/**
 * @example
 * const renderLoopManager = new RenderLoopManager();
 * (async function() {
 *    for await (const frameTime of self._renderLoopManager.loop()) {
 *       renderFrame(frameTime);
 *    }
 * })();
 */
export default class RenderLoopManager {
    constructor() {
        this._resolve = DO_NOTHING;
        this._frameHandle = 0;
        this._isDestroyed = false;

        const self = this;
        // OH MY ...
        this.loop = async function* () {
            while (!this._isDestroyed) {
                yield await new Promise((resolve) => {
                    self._resolve = resolve;
                });
            }
        };
    }

    public loop: Function;

    /**
     * Schedule rendering in the next frame.
     */
    public run() {
        if (!this._frameHandle && !this._isDestroyed) {
            this._frameHandle = requestAnimationFrame((time) => {
                this._frameHandle = 0;
                this._resolve(time);
                this._resolve = DO_NOTHING;
            });
        }
    }

    /**
     * Render in each frame
     */
    public start() {
        this.stop();
        if (!this._isDestroyed) {
            this._frameHandle = requestAnimationFrame((time) => {
                this._frameHandle = 0;
                this._resolve(time);
                this._resolve = DO_NOTHING;
                this.run();
            });
        }
    }

    /**
     * Don't render in the next frame.
     */
    public stop() {
        if (this._frameHandle) {
            cancelAnimationFrame(this._frameHandle);
            this._frameHandle = 0;
        }
    }

    public destroy() {
        this.stop();
        this._isDestroyed = true;
    }

    private _isDestroyed: boolean;
    private _frameHandle: number;
    private _resolve: Function;
}

// ES2018 version
// function createLoop() {
//     let lastResolve = () => {};
//     let frameHandle = 0;

//     const loop = async function* () {
//         while (true) {
//             yield await new Promise((resolve) => {
//                 lastResolve = resolve;
//             });
//         }
//     };

//     loop.stop = function() {
//         if (frameHandle) {
//             cancelAnimationFrame(frameHandle);
//             frameHandle = 0;
//         }
//     };
//     loop.run = function() {
//         if (!frameHandle) {
//             frameHandle = requestAnimationFrame((time) => {
//                 frameHandle = 0;
//                 lastResolve(time);
//             });
//         }
//     }
//     return loop;
// }
