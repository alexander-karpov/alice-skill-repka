import { Character } from './character';

export enum Dialogs {
    Story = 'Story',
    RepeatQuestion = 'RepeatQuestion'
}

export type SessionData = {
    chars: Character[];
    currentDialog: Dialogs;
};

export function createSessionData() {
    return {
        chars: [],
        currentDialog: Dialogs.Story,
        isExitRequested: false
    };
}
