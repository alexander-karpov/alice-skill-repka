import * as fs from 'fs';
import * as path from 'path';
import { WebhookRequest, WebhookResponse } from './server';

export function openLogFile(logsDir: string): number {
    return fs.openSync(path.join(logsDir, `./log.txt`), 'a');
}

export function appendToLog(
    fd: number,
    request: WebhookRequest,
    response: WebhookResponse,
    time: Date,
) {
    // Очень много таких сообщений
    if (request.request.nlu.tokens.includes('ping')) {
        return;
    }

    const message = formatMessage(request, response, time);

    fs.appendFile(fd, message + '\n', error => {
        if (error) {
            console.log(error);
        }
    });
}

export function closeLogFile(fd: number) {
    fs.closeSync(fd);
}

function formatMessage(request: WebhookRequest, response: WebhookResponse, time: Date) {
    const user = request.session.user_id;
    const timeText = `${time.getMonth() +
        1}mo ${time.getDate()}d ${time.getHours()}h ${time.getMinutes()}m ${time.getSeconds()}s`;
    const requestText = request.request.nlu.tokens.join(' ');
    const responseTts = (response.response.tts || '').substr(0, 64);
    const responseText = response.response.text.substr(0, 64);

    return `${timeText} ${user}\n${requestText}\n${responseTts}\n${responseText}\n\n`;
}
