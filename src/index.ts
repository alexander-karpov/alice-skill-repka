import { startServer } from './server';
import { dialog } from './dialog';
import { spawnMystem } from './stemmer';
import { Person } from './Profile';

const { stemmer, killStemmer } = spawnMystem();
const userData: { [sessionKey: string]: Person[] } = {}

startServer(
    async request => {
        const sessionId = request.session.session_id;
        const userId = request.session.user_id;
        const sessionKey = `${userId}-${sessionId}`;

        if (!userData[sessionKey]) {
            userData[userId] = []
        }

        const persons = userData[userId];

        return {
            response: {
                text: await dialog(request.request.command, {
                    stemmer,
                    persons
                }),
                end_session: false
            },
            session: request.session,
            version: request.version
        };
    },
    () => killStemmer()
);
