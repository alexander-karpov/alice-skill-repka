import { WebhookRequest } from './server';
import { Session } from './Session';
import * as LRU from 'lru-cache';

export class SessionStorage {
    private readonly sessions: LRU<string, Session> = new LRU<string, Session>({
        // Один час
        maxAge: 1000 * 60 * 60,
    });

    private constructor() {}

    static create(): SessionStorage {
        return new SessionStorage();
    }

    $ensureSession(time: number, request: WebhookRequest): Session {
        const sessionId = request.session.session_id;
        const existsSession = this.sessions.get(sessionId);

        if (existsSession) {
            return existsSession;
        }

        const newSession = Session.create(time);
        this.sessions.set(sessionId, newSession);
        this.sessions.prune();

        return newSession;
    }

    $updateSession(request: WebhookRequest, session: Session) {
        const sessionId = request.session.session_id;
        this.sessions.set(sessionId, session);
    }
}
