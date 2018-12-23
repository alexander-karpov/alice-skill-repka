import { Character } from './character';

export enum Dialogs {
    Story = 'Story',
    RepeatQuestion = 'RepeatQuestion',
}

export enum GameMode {
    Classic = 'Classic',
    BlackCity = 'BackCity',
}

export type SessionData = {
    chars: Character[];
    currentDialog: Dialogs;
    mode: GameMode;
    isNewSession: boolean;
};

export function createSessionData(): SessionData {
    return {
        chars: [],
        currentDialog: Dialogs.Story,
        isNewSession: false,
        mode: GameMode.Classic,
    };
}
