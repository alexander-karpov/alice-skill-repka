import * as assert from 'assert';
import { Precentation } from './Precentation';
import { PresentationBuilder } from './PresentationBuilder';
import { InstantPresentationBuilder } from './InstantPresentationBuilder';
import { TransitionHandler } from './TransitionHandler';
import { ScreenContext } from './ScreenContext';
import { SceneBuilder } from './SceneBuilder';
// Терминальная цвена не должна быть без представления

export type SetState<TState> = (patch: Partial<TState>) => void;

export type InteractionHandler<TState, TSceneId> = (
    command: string,
    state: TState,
    setState: SetState<TState>
) => TSceneId;

/**
 * @param TState Состояние будет доступно в методах определения сцены
 * @param TSceneId Можно указать список возможных сцен чтобы исключить случайную ошибку при их определении
 */
export class DialogBuilder<TState, TSceneId = string> {
    private scenes: Map<TSceneId, SceneBuilder<TState, TSceneId>> = new Map();
    private globalInteractionHandler?: InteractionHandler<TState, TSceneId | undefined>;

    withScene = (sceneId: TSceneId) => {
        const newScene = this.createScene(sceneId);

        return {
            withPresentation: function(...params: Parameters<typeof newScene.withPresentation>) {
                newScene.withPresentation(...params);

                return {
                    withTransition: newScene.withTransition,
                    withInteraction: newScene.withInteraction,
                };
            },

            withTransition: newScene.withTransition,
            withInteraction: newScene.withInteraction,
        };
    };

    interact(
        command: string,
        context: ScreenContext<TState, TSceneId>
    ): [Precentation, ScreenContext<TState, TSceneId>] {
        context.$previousScene = context.$currentScene;

        if (this.globalInteractionHandler) {
            const contextAfterGlobalInteraction = this.applyTransition(
                context,
                this.globalInteractionHandler.bind(this, command)
            );

            if (contextAfterGlobalInteraction.$currentScene) {
                const cs = contextAfterGlobalInteraction.$currentScene;

                const contextAfterInteraction: ScreenContext<TState, TSceneId> = {
                    ...contextAfterGlobalInteraction,
                    $currentScene: cs,
                    $previousScene: context.$previousScene,
                };

                const output = new InstantPresentationBuilder();
                const contextAfterPlayScene = this.playScene(contextAfterInteraction, output);

                return [output.build(), contextAfterPlayScene];
            } else {
                // FIXME: Изменяет входной параметр
                context = {
                    ...contextAfterGlobalInteraction,
                    $currentScene: context.$currentScene,
                    $previousScene: context.$previousScene,
                };
            }
        }

        const scene = this.getScene(context.$currentScene);

        if (!scene.hasInteraction) {
            throw new Error(`У сцены ${context.$currentScene} не указано Interaction`);
        }

        const contextAfterInteraction = this.applyTransition(
            context,
            scene.applyInteraction.bind(scene, command)
        );

        const output = new InstantPresentationBuilder();
        const contextAfterPlayScene = this.playScene(contextAfterInteraction, output);

        return [output.build(), contextAfterPlayScene];
    }

    withGlobalInteraction = (handler: InteractionHandler<TState, TSceneId | undefined>): void => {
        assert(!this.globalInteractionHandler, 'Обработчик уже задан');

        this.globalInteractionHandler = handler;
    };

    private applyTransition = <TSceneId>(
        context: ScreenContext<TState, TSceneId>,
        transition: TransitionHandler<TState, TSceneId>
    ): ScreenContext<TState, TSceneId> => {
        const patches: Partial<TState>[] = [];

        const nextSceneId = transition(context, patch => patches.push(patch));

        return Object.assign({}, context, ...patches, {
            $currentScene: nextSceneId,
        });
    };

    private playScene(
        context: ScreenContext<TState, TSceneId>,
        output: PresentationBuilder
    ): ScreenContext<TState, TSceneId> {
        const scene = this.getScene(context.$currentScene);

        if (scene.hasPrecentation) {
            scene.buildPrecentation(output, context);
        }

        if (scene.hasTransition) {
            const contextAfterTransition = this.applyTransition(
                context,
                scene.applyTransition.bind(scene)
            );

            return this.playScene(contextAfterTransition, output);
        }

        return context;
    }

    private getScene(sceneId: TSceneId): SceneBuilder<TState, TSceneId> {
        const scene = this.scenes.get(sceneId);

        if (!scene) {
            throw new Error(`Сцена ${sceneId} не существует.`);
        }

        return scene;
    }

    private createScene(sceneId: TSceneId) {
        if (this.scenes.has(sceneId)) {
            throw new Error(`Сцена ${sceneId} уже существует.`);
        }

        const newScene = new SceneBuilder<TState, TSceneId>();
        this.scenes.set(sceneId, newScene);

        return newScene;
    }
}
