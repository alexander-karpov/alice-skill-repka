export type Speech = {
    text: string;
    tts: string;
    ttsOnly: boolean;
};

export function createSpeech(
    text: string,
    tts: string = text,
    { ttsOnly }: { ttsOnly: boolean } = { ttsOnly: false }
): Speech {
    return { text, tts, ttsOnly };
}

export function concatSpeech(...items: (Speech | string)[]): Speech {
    const text: string[] = [];
    const tts: string[] = [];

    items.filter(Boolean).forEach(s => {
        if (isSpeech(s)) {
            if (!s.ttsOnly) {
                text.push(s.text);
            }

            tts.push(s.tts);
        } else {
            text.push(s);
            tts.push(s);
        }
    });

    return createSpeech(fixSpeceBeforeComma(text.join(' ')), fixSpeceBeforeComma(tts.join(' ')));
}

function isSpeech(x): x is Speech {
    return typeof x.text === 'string' && typeof x.tts === 'string';
}

function fixSpeceBeforeComma(text) {
    return text.replace(' ,', ',').replace(' .', '.');
}
