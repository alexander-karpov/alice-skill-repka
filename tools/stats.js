const axios = require('axios');
const _ = require('lodash');

const SRC = '';

function printStats(log) {
    const records = splitByLines(log.data)
        .filter(isRequestLine)
        .map(parseRequestLine);

    const knownUsers = [];
    _.forEach(_.groupBy(records, rec => rec.d), (byDay, day) => {
        const byUser = _.groupBy(byDay, rec => rec.user);
        const newUsers = _.filter(_.keys(byUser), user => !knownUsers.includes(user));
        const requests = byDay.length;
        const users = _.size(byUser);
        const newUsersCount = _.size(newUsers);
        const knownUsersCount = users - newUsersCount;
        const requestsPerUser = requests / users;
        const pad = 12;

        console.log(`День ${day}`);
        console.log(`${'Запросов:'.padEnd(pad)} ${_.repeat('█', requests / 10)} ${requests}`);
        console.log(`${'Пользов.:'.padEnd(pad)} ${_.repeat('█', users)} ${users}`);
        console.log(`${'Новых:'.padEnd(pad)} ${_.repeat('█', newUsersCount)} ${newUsersCount}`);
        console.log(
            `${'Повторных:'.padEnd(pad)} ${_.repeat('█', knownUsersCount)} ${knownUsersCount}`,
        );
        console.log(
            `${'Зап/польз.:'.padEnd(pad)} ${_.repeat('█', requestsPerUser)} ${requestsPerUser}`,
        );
        console.log(``);

        knownUsers.push(..._.keys(byUser));
    });
}

function splitByLines(text) {
    return text.split('\n');
}

function isRequestLine(line) {
    return /^\d+d /.test(line);
}

function parseRequestLine(line) {
    const [all, d, h, m, s, user] = line.match(/^(\d+)d (\d+)h (\d+)m (\d+)s +([A-Z|0-9]+)/);
    return { d, h, m, s, user };
}

axios.get(SRC).then(printStats);
