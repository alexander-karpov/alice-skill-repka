export type Speech = {
    text: string;
    tts: string;
};

export function createSpeech(text: string, tts: string = text): Speech {
    return { text, tts };
}

export function speak(...items: (Speech | string | [string, string])[]): Speech {
    const text: string[] = [];
    const tts: string[] = [];

    items.filter(Boolean).forEach(s => {
        if (typeof s === 'string') {
            text.push(s);
            tts.push(s);
        } else if (Array.isArray(s)) {
            text.push(s[0]);
            tts.push(s[1]);
        } else {
            text.push(s.text);
            tts.push(s.tts);
        }
    });

    return {
        text: fixSpeceBeforeComma(text.filter(Boolean).join(' ')),
        tts: fixSpeceBeforeComma(tts.filter(Boolean).join(' ')),
    };
}

export function tts(parts: TemplateStringsArray, ...inserts: string[]): Speech {
    const ttsAcc: string[] = [];

    parts.forEach((part, i) => {
        ttsAcc.push(part);

        if (inserts[i]) {
            ttsAcc.push(inserts[i]);
        }
    });

    return {
        text: fixSpeceBeforeComma(parts.join('')),
        tts: fixSpeceBeforeComma(ttsAcc.join('')),
    };
}

function fixSpeceBeforeComma(text: string) {
    return text
        .replace(' ,', ',')
        .replace(' .', '.')
        .replace('  ', ' ')
        .replace('   ', ' ');
}
