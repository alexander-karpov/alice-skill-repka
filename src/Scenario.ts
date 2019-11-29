import { SceneResult } from './SceneResult';
import { SceneParams } from './SceneParams';
import { Scene } from './Scene';

type ScenesImplementation = {
    [P in Scene]: (params: SceneParams) => SceneResult;
};

export abstract class Scenario implements ScenesImplementation {
    constructor(private readonly currentScene: Scene = 'intro') {}

    abstract intro(params: SceneParams): SceneResult;

    abstract repka(params: SceneParams): SceneResult;

    abstract repeatOffer(params: SceneParams): SceneResult;

    abstract create(scene: Scene): Scenario;

    current(params: SceneParams): SceneResult {
        return this[this.currentScene](params);
    }
}
