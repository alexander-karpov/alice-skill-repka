import { startServer } from './server';
import { dialog } from './dialog';
import { spawnMystem } from './stemmer';
import { Character } from './character';

export function startSkillServer({ port }) {
    const { stemmer, killStemmer } = spawnMystem();
    const userData: { [sessionKey: string]: Character[] } = {};

    startServer(
        async request => {
            const sessionId = request.session.session_id;
            const userId = request.session.user_id;
            const sessionKey = `${userId}-${sessionId}`;

            if (!userData[sessionKey]) {
                userData[sessionKey] = [];
            }

            const characters = userData[sessionKey];

            return {
                response: {
                    text: await dialog(request.request.command, {
                        stemmer,
                        characters
                    }),
                    end_session: false
                },
                session: request.session,
                version: request.version
            };
        },
        () => killStemmer(),
        { port }
    );
}
