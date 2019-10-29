import { WebhookRequest } from './server';
import { Session } from './Session';

export class SessionStorage {
    private readonly sessions: { [sessionId: string]: Session } = {};

    private constructor() {}

    static create(): SessionStorage {
        return new SessionStorage();
    }

    $ensureSession(request: WebhookRequest): Session {
        const sessionId = request.session.user_id;
        const isNewSession = request.session.new;
        const existsSession = this.sessions[sessionId];

        if (!isNewSession && existsSession) {
            return existsSession;
        }

        const newSession = Session.create();
        this.sessions[sessionId] = newSession;

        return newSession;
    }

    $updateSession(request: WebhookRequest, session: Session) {
        const sessionId = request.session.user_id;
        this.sessions[sessionId] = session;
    }
}
