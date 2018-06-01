import * as THREE from 'three';
import RenderLoopManager from './render_loop_manager';

const TILE_SIZE = new THREE.Vector3(1, 0.1, 1);
const BOARD_SIZE = new THREE.Vector3(3.3, 0, 3.3);

const ANIMATION_FACT = 100;
const EPSILON = 0.0001;

export default class Tile extends THREE.Object3D {
    constructor(value: number) {
        super();
        this.value = value;
        this.type = 'Tile';

        if (!Tile._allTiles) {
            Tile._allTiles = [];
        }

        if (value) {
            this._boxGeometry = new THREE.CubeGeometry(TILE_SIZE.x, TILE_SIZE.y, TILE_SIZE.z);
            // It is better to use Half-Lambert
            this._boxMaterial = new THREE.MeshLambertMaterial({
                // for debug purpose
                color: 0x0000D0
            });
            this._mesh = new THREE.Mesh(this._boxGeometry, this._boxMaterial);

            this._addText();

            this.add(this._mesh);
            Tile._allTiles.push(this);

            this._lastAnimTime = -1;
        }
    }

    public static setFont(font: THREE.Font) {
        this._font = font;
        const tiles = Tile._allTiles;

        for (const tile of tiles) {
            tile._removeText();
            tile._addText();
        }

        if (Tile.renderLoopManager) {
            Tile.renderLoopManager.run();
        }
    }

    private _removeText() {
        if (this._textMesh) {
            this._textMesh.remove();
            this._textMesh = null;
        }
    }

    private _addText() {
        // TODO: remove magic numbers
        if (Tile._font) {
            // This code is sooo bad.
            const size = 0.3 * TILE_SIZE.x;
            const textGeometry = new THREE.TextGeometry(this.value.toString(), {
                font: Tile._font,
                size: size,
                height: TILE_SIZE.y / 4,
                curveSegments: 4,
                bevelThickness: 0.01,
                bevelSize: 0.01,
                bevelEnabled: true
            });
            textGeometry.computeBoundingBox();
            textGeometry.computeVertexNormals();
            const textMaterial = new THREE.MeshLambertMaterial({
                color: 0xAAAAAAA
            });
            const textMesh = new THREE.Mesh(textGeometry, textMaterial);
            this._mesh.add(textMesh);
            // disable matrix auto update
            textMesh.rotateX(Math.PI / 2);
            textMesh.rotateZ(Math.PI);
            textMesh.rotateY(Math.PI);
            textMesh.position.y = TILE_SIZE.y / 4;
            const geometrySize = textGeometry.boundingBox.getSize(new THREE.Vector3());
            textMesh.position.x = -geometrySize.x / 2;
            textMesh.position.z = geometrySize.z / 2;
        }
    }

    public move(place: number) {
        if (this.value) {
            this._isMoving = true;
        }
        this.place = place;
    }

    public animate(time: number) {
        if (this.isMoving()) {
            if (this._lastAnimTime < 0) {
                this._lastAnimTime = time;
                return;
            }
            const targetX = - BOARD_SIZE.x / 2 + this.place % 4 * (TILE_SIZE.x + 0.1);
            const targetZ = - BOARD_SIZE.z / 2 + Math.floor(this.place / 4) * (TILE_SIZE.z + 0.1);
            const deltaX = targetX - this.position.x;
            const deltaZ = targetZ - this.position.z;
            const animFactor = Math.min((time - this._lastAnimTime) / ANIMATION_FACT, 1);
            this._lastAnimTime = time;
            this.position.x += deltaX * animFactor;
            this.position.z += deltaZ * animFactor;
            if (Math.abs(this.position.x - targetX) < EPSILON &&
                    Math.abs(this.position.z - targetZ) < EPSILON) {
                this._isMoving = false;
                this._lastAnimTime = -1;
            }
        }
    }

    public isMoving() {
        return this._isMoving;
    }

    public getMesh() {
        return this._mesh;
    }

    public destroy() {
        // TODO: add destroy logic
    }

    public setToPlace(place: number) {
        this.place = place;
        this.position.x = - BOARD_SIZE.x / 2 + this.place % 4 * (TILE_SIZE.x + 0.1);
        this.position.z = - BOARD_SIZE.z / 2 + Math.floor(this.place / 4) * (TILE_SIZE.z + 0.1);
    }

    // SRY for that. I don't have time to write it in right way
    public value: number;
    public place: number;
    public static renderLoopManager: RenderLoopManager | null;

    private static _allTiles: Array<Tile>;
    private static _font: THREE.Font | null;

    private _isMoving: boolean;
    private _lastAnimTime: number;
    private _mesh: THREE.Mesh;
    private _textMesh: THREE.Mesh | null;
    private _boxGeometry: THREE.Geometry;
    private _boxMaterial: THREE.Material;
}

const loader = new THREE.FontLoader();
loader.load('optimer_bold.typeface.json', (response) => Tile.setFont(response));