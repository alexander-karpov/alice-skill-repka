import { Character } from './character';

export enum Dialogs {
    Story = 'Story',
    RepeatQuestion = 'RepeatQuestion'
}

export type SessionData = {
    chars: Character[];
    currentDialog: Dialogs;
    isNewSession: boolean;
};

export function createSessionData(): SessionData {
    return {
        chars: [],
        currentDialog: Dialogs.Story,
        isNewSession: false
    };
}
