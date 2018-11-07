import * as http from 'http';

//#region types
export type RequestHandler = (request: WebhookRequest) => Promise<WebhookResponse>;

export type WebhookRequest = {
    meta: {
        locale: string; // 'ru-RU';
        timezone: string; // 'Europe/Moscow';
        client_id: string; // 'ru.yandex.searchplugin/5.80 (Samsung Galaxy; Android 4.4)';
    };
    request: {
        command: string; // 'где ближайшее отделение';
        original_utterance: string; // 'Алиса спроси у Сбербанка где ближайшее отделение';
        markup: {
            dangerous_context: boolean;
        };
    };
    session: {
        new: boolean; // пользователь начал новый разговор с навыком;
        message_id: number;
        session_id: string; // '2eac4854-fce721f3-b845abba-20d60';
        skill_id: string; // '3ad36498-f5rd-4079-a14b-788652932056';
        user_id: string; // 'AC9WC3DF6FCE052E45A4566A48E6B7193774B84814CE49A922E163B8B29881DC';
    };
    version: string; // '1.0';
};

export type WebhookResponse = {
    response: {
        text: string; // 'Здравствуйте! Это мы, хороводоведы.';
        tts?: string; // 'Здравствуйте! Это мы, хоров+одо в+еды.';
        end_session: boolean;
    };
    session: {
        session_id: string; // '2eac4854-fce721f3-b845abba-20d60';
        message_id: number; // 4;
        user_id: string; // 'AC9WC3DF6FCE052E45A4566A48E6B7193774B84814CE49A922E163B8B29881DC';
    };
    version: string; // '1.0';
};
//#endregion

const SERVER_POST = 1234;

export function startServer(handleRequest: RequestHandler, handleCLose: () => void) {
    const server = http.createServer((request, response) => {
        if (request.method !== 'POST') {
            response.writeHead(200);
            response.end('Yandex Alice "My Calories" skill');
            return;
        }

        let body = '';

        request.on('data', data => {
            body += data.toString();
        });

        request.on('end', () => {
            const json = JSON.parse(body);

            handleRequest(json).then(reply => {
                response.setHeader('Content-Type', 'application/json');
                response.writeHead(200);
                response.end(JSON.stringify(reply));
            });
        });
    });

    server.listen(SERVER_POST, err => {
        if (err) {
            return console.log('Ошибка при старте сервера', err);
        }

        console.log(`Alice MyCalories server is listening on ${SERVER_POST}`);
    });

    server.on('close', () => {
        console.log(`Alice Kolobok server is closing...`);
        handleCLose();
    });

    process.on('SIGINT', () => server.close());

    return server;
}
