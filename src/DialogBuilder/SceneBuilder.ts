import * as assert from 'assert';
import { PresentationBuilder } from './PresentationBuilder';
import { TransitionHandler } from './TransitionHandler';
import { ScreenContext } from './ScreenContext';
import { InteractionHandler, SetState } from './DialogBuilder';

export class SceneBuilder<TState, TSceneId> {
    private precentationDesc?: (
        bilder: PresentationBuilder,
        context: ScreenContext<TState, TSceneId>
    ) => void;
    private transition?: TransitionHandler<TState, TSceneId>;
    private interactionHandler?: InteractionHandler<TState, TSceneId>;

    withPresentation = (
        desc: (bilder: PresentationBuilder, context: ScreenContext<TState, TSceneId>) => void
    ) => {
        if (this.precentationDesc) {
            throw new Error('Описание представления уже задано.');
        }
        this.precentationDesc = desc;
    };
    get hasPrecentation(): boolean {
        return Boolean(this.precentationDesc);
    }
    buildPrecentation = (
        builder: PresentationBuilder,
        context: ScreenContext<TState, TSceneId>
    ): void => {
        if (!this.precentationDesc) {
            throw new Error('Описание представления не задано. Используйте hasPrecentation.');
        }
        this.precentationDesc(builder, context);
    };
    withTransition = (transition: TransitionHandler<TState, TSceneId>) => {
        assert(!this.transition, 'Обработчик уже задан');
        this.transition = transition;
    };
    get hasTransition(): boolean {
        return Boolean(this.transition);
    }
    applyTransition = (
        context: ScreenContext<TState, TSceneId>,
        setState: SetState<TState>
    ): TSceneId => {
        if (!this.transition) {
            throw new Error('Перемещение не задано. Используйте hasTransitio.');
        }
        return this.transition(context, setState);
    };
    withInteraction = (handler: InteractionHandler<TState, TSceneId>): void => {
        assert(!this.interactionHandler, 'Обработчик уже задан');
        this.interactionHandler = handler;
    };
    get hasInteraction(): boolean {
        return Boolean(this.interactionHandler);
    }
    applyInteraction = (
        command: string,
        ccontext: ScreenContext<TState, TSceneId>,
        setState: SetState<TState>
    ): TSceneId => {
        if (!this.interactionHandler) {
            throw new Error('Перемещение не задано. Используйте hasTransitio.');
        }
        return this.interactionHandler(command, ccontext, setState);
    };
}
