import * as fs from 'fs';
import * as path from 'path';
import { WebhookRequest } from './server';

export function openLogFile(logsDir: string): number {
    return fs.openSync(path.join(logsDir, `./log.txt`), 'a');
}

export function appendToLog(fd: number, request: WebhookRequest, time: Date) {
    const message = formatMessage(request, time);

    fs.appendFile(fd, message + '\n', error => {
        if (error) {
            console.log(error);
        }
    });
}

export function closeLogFile(fd: number) {
    fs.closeSync(fd);
}

function formatMessage(request: WebhookRequest, time: Date) {
    const user = request.session.user_id.substr(0, 10);
    const timeText = `${time.getDate()}d ${time.getHours()}h ${time.getMinutes()}m ${time.getSeconds()}s`;
    const requestText = request.request.nlu.tokens.join(' ');

    return `${timeText.padEnd(16)} ${user} ${requestText}`;
}
