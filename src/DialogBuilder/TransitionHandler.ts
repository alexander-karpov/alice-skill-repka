import { SetState } from './DialogBuilder';
import { ScreenContext } from './ScreenContext';

export type TransitionHandler<TState, TScreenId> = (
    context: ScreenContext<TState, TScreenId>,
    setState: SetState<TState>
) => TScreenId;
