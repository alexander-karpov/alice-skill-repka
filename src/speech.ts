export type Speech = {
    text: string;
    tts: string;
};

export function createSpeech(text: string, tts: string = text): Speech {
    return { text, tts };
}

export function concatSpeech(...items: (Speech | string)[]): Speech {
    const text: string[] = [];
    const tts: string[] = [];

    items.filter(Boolean).forEach(s => {
        if (isSpeech(s)) {
            text.push(s.text);
            tts.push(s.tts);
        } else {
            text.push(s);
            tts.push(s);
        }
    });

    return createSpeech(
        fixSpeceBeforeComma(text.filter(Boolean).join(' ')),
        fixSpeceBeforeComma(tts.filter(Boolean).join(' ')),
    );
}

function isSpeech(x): x is Speech {
    return typeof x.text === 'string' && typeof x.tts === 'string';
}

function fixSpeceBeforeComma(text) {
    return text.replace(' ,', ',').replace(' .', '.');
}
