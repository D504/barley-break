import * as THREE from 'three';
import Tile from './tile';

function shuffleRange(start: number, length: number): Array<number>{
    const array = new Array(length);
    for (let i = 0; i < length; i++) {
        array[i] = i + start;
    }

    for (let i = length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * i);

        const buf = array[i];
        array[i] = array[j];
        array[j] = buf;
    }

    return array;
}

// TODO: inherit Object3D
export class GameField {
    constructor(scene: THREE.Scene, camera: THREE.Camera) {
        // TODO: remove magic number
        const fieldWidth = this._fieldWidth = 4;
        this._fieldSize = 16;
        if (fieldWidth !== Math.floor(fieldWidth)) {
            this._fieldWidth = Math.floor(this._fieldWidth);
            console.error('Wrong field size.');
        }
        const field = shuffleRange(1, 15);
        // add empty tile
        field.push(0);

        // TODO: remove magic number
        this._emptyTilePlace = 15;

        this._gameField = field.map((el, index) => {
            const tile = new Tile(el);
            scene.add(tile);

            tile.setToPlace(index);
            return tile;
        });

        if (!this._isSolvable()) {
            this._swap(0, 1);

            this._gameField[0].setToPlace(0);
            this._gameField[1].setToPlace(1);
        }

        this._camera = camera;
        this._raycaster = new THREE.Raycaster();
    }

    public isCompleted() {
        return this._gameField.every((tile) => {
            return tile.value === 0 || tile.value - 1 === tile.place;
        });
    }

    public move(tile: Tile) {
        const place = tile.place;
        if (!this._gameField[place]) {
            return false;
        }

        const neighbors = new Array();

        if (place % this._fieldWidth) {
            neighbors.push(place - 1);
        }
        if (place % this._fieldWidth !== this._fieldWidth - 1) {
            neighbors.push(place + 1);
        }
        if (Math.floor(place / this._fieldWidth)) {
            neighbors.push(place - this._fieldWidth);
        }
        if (Math.floor(place / this._fieldWidth) !== this._fieldWidth - 1) {
            neighbors.push(place + this._fieldWidth);
        }

        if (neighbors.indexOf(this._emptyTilePlace) !== -1) {
            const neighbor = this._emptyTilePlace;
            this._swap(place, neighbor);

            this._gameField[place].move(place);
            this._gameField[neighbor].move(neighbor);

            this._emptyTilePlace = place;
            return true;
        } else {
            return false;
        }
    }

    public debugOutput() {}

    public destroy() {
        // TODO: add logic
    }

    public getPickedTile(coords: THREE.Vector2) {
        const tileMeshes = this._gameField
                .map((el) => el.getMesh())
                .filter((el) => el);

        this._raycaster.setFromCamera(coords, this._camera);

        const intersections = this._raycaster.intersectObjects(tileMeshes);

        if (intersections.length) {
            return intersections[0].object.parent as Tile;
        } else {
            return null;
        }
    }

    public animate(time: number) {
        for (const tile of this._gameField) {
            tile.animate(time);
        }
    }

    public isInteractive() {
        return this._gameField.some((tile) => tile.isMoving());
    }

    private _swap(el1: number, el2: number) {
        const buf = this._gameField[el1];
        this._gameField[el1] = this._gameField[el2];
        this._gameField[el2] = buf;
    }

    private _isSolvable() {
        let disorderCount = 0;
        for (let i = 0; i < this._fieldSize - 2; i++) {
            for (let j = i + 1; j < this._fieldSize - 1; j++) {
                if (this._gameField[i].value > this._gameField[j].value) {
                    disorderCount++;
                }
            }
        }

        return !(disorderCount % 2);
    }

    private _gameField: Array<Tile>;
    private _fieldWidth: number;
    private _emptyTilePlace: number;
    private _fieldSize: number;

    private _camera: THREE.Camera;
    private _raycaster: THREE.Raycaster;
}
