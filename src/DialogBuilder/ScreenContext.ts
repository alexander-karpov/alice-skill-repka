export type ScreenContext<TState, TScreenId = string> = TState & {
    $currentScene: TScreenId;
    $previousScene: TScreenId;
};
