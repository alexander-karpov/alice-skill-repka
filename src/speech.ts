export type Speech = {
    text: string;
    tts: string;
};

export function createSpeech(text: string, tts: string = text): Speech {
    return { text, tts };
}

export function joinSpeech(items: Speech[]): Speech {
    const text: string[] = [];
    const tts: string[] = [];

    items.forEach(s => {
        text.push(s.text);
        tts.push(s.tts);
    });

    return createSpeech(text.join(' '), tts.join(' '));
}

export function concatSpeech(...items: (Speech | string)[]): Speech {
    const xs = items.map(s => (isSpeech(s) ? s : createSpeech(s)));
    return joinSpeech(xs);
}

function isSpeech(x): x is Speech {
    return typeof x.text === 'string' && typeof x.tts === 'string';
}
