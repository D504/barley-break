import * as THREE from 'three';
import 'three/OrbitControls';

import RenderLoopManager from './render_loop_manager';
import {GameField} from './field';

export default class Application {
    public constructor() {
        this._initGL();
        this._initScene();

        this._mouse = new THREE.Vector2();

        window.addEventListener('mousemove', (event) => this._onMouseMove(event));
        window.addEventListener('mousedown', (event) => this._onMouseDown(event));

        this._renderLoopManager = new RenderLoopManager();
        this.start();
    }

    public start() {
        // It is a main loop written in a sync style.
        const self = this;
        (async function() {
            for await (const frameTime of self._renderLoopManager.loop()) {
                self._tick(frameTime);
            }
        })();
    }

    public destroy() {
        this._renderLoopManager.destroy();
        // TODO: destroy everything
    }

    public resize(width: number, height: number) {
        const camera = this._camera;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();

        this._renderer.setSize(width, height);

        this._renderLoopManager.run();
    }

    public _onMouseMove(event: MouseEvent) {
        // this._mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        // this._mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

        // const hoverTile = this._field.getPickedTile(this._mouse);

        this._renderLoopManager.run();
    }

    public _onMouseDown(event: MouseEvent) {
        this._mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this._mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

        const pickedTile = this._field.getPickedTile(this._mouse);

        if (pickedTile && !this._field.isCompleted()) {
            this._field.move(pickedTile);
        }
        this._renderLoopManager.run();
    }

    private _initGL() {
        const renderer = this._renderer = new THREE.WebGLRenderer();
        renderer.setClearColor(0x101010);

        document.body.appendChild(renderer.domElement);
    }

    private _initScene() {
        const scene = this._scene = new THREE.Scene();

        const camera = this._camera = new THREE.PerspectiveCamera(
            75, window.innerWidth / window.innerHeight, 0.1, 1000
        );
        camera.matrixAutoUpdate = false;
        camera.position.x = 0;
        camera.position.y = 5;
        camera.position.z = 0;
        camera.lookAt(scene.position);
        camera.updateMatrix();

        const controls = this._cameraControl = new THREE.OrbitControls(camera);
        controls.addEventListener('change', () => {
            this._renderLoopManager.run();
        });

        const directionLight = new THREE.DirectionalLight(0xffffff, 1.0);
        directionLight.position.set(1, 1, 1);
        scene.add(directionLight);

        // const helper = new THREE.GridHelper( 1200, 60, 0xFF4444, 0x404040 );
        // scene.add(helper);
        // const axis = new THREE.AxesHelper(10);
        // scene.add(axis);

        this._field = new GameField(this._scene, this._camera);
    }

    public _tick(time: number) {
        this._cameraControl.update();
        this._camera.updateMatrix();

        if (this._field.isInteractive()) {
            this._field.animate(time);
            this._renderLoopManager.run();
        }
        this._renderer.render(this._scene, this._camera);
    }

    private _camera: THREE.PerspectiveCamera;
    private _cameraControl: THREE.OrbitControls;
    private _scene: THREE.Scene;
    private _renderer: THREE.WebGLRenderer;
    private _field: GameField;

    private _renderLoopManager: RenderLoopManager;
    private _mouse: THREE.Vector2;
}
