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
        nlu: {
            tokens: string[]; // Массив слов из произнесенной пользователем фразы.
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
        buttons?: ({
            title: string;
            url?: string;
            hide?: boolean; // Признак того, что кнопку нужно убрать после следующей реплики пользователя.
        })[];
        card?: {
            type: string;
            image_id: string;
            title?: string;
            description?: string;
        };
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

export function startServer(handleRequest: RequestHandler, handleCLose: () => void, { port }) {
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

        request.on('end', async () => {
            try {
                const reply = await handleRequest(JSON.parse(body));

                response.setHeader('Content-Type', 'application/json');
                response.writeHead(200);
                response.end(JSON.stringify(reply));
            } catch (error) {
                console.log(`${new Date().toISOString()} Handle request error.`, error);
                response.writeHead(400);
                response.end('400 Bad request');
            }
        });
    });

    server.listen(port, err => {
        if (err) {
            return console.log('Ошибка при старте сервера', err);
        }

        console.log(`Alice Repka server is listening on ${port}`);
    });

    server.on('close', () => {
        console.log(`Alice Repka server is closing...`);
        handleCLose();
    });

    process.on('SIGINT', () => server.close());

    return server;
}
