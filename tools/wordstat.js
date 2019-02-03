const axios = require('axios');
const _ = require('lodash');
const { logsUrl } = require('./secret.json');
const { spawnMystem } = require('./stemmer');

async function printStats(log) {
    const { stemmer, killStemmer } = spawnMystem();

    const records = splitRequests(log.data)
        .map(extractMessage)
        .filter(Boolean);

    const counters = {};

    for (let word of records) {
        const lemmas = await stemmer(word);
        const clear = lemmas.replace(/{|}/g, '');

        if (!counters[clear]) {
            counters[clear] = 1;
        } else {
            counters[clear] += 1;
        }
    }

    killStemmer();

    const mapped = Object.keys(counters).map(key => ({ word: key, count: counters[key] }));
    const sorted = _.sortBy(mapped, o => -o.count);
    sorted.forEach(r => console.log(`${r.word} ${r.count}`));
}

function splitRequests(text) {
    return text.split('\n\n\n');
}

function extractMessage(req) {
    return req.split('\n')[1];
}

axios.get(logsUrl).then(printStats);
