const SESSION_KEY = "session";

export interface SessionUser {
  id: string;
  username: string;
  full_name: string;
}

export interface Session {
  token: string;
  user: SessionUser;
}

export const getSession = (): Session | null => {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
};

export const setSession = (data: Session): void => {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(data));
};

export const clearSession = (): void => {
  sessionStorage.removeItem(SESSION_KEY);
};

export const getSessionUser = (): SessionUser | null => {
  return getSession()?.user ?? null;
};

export const getSessionToken = (): string | null => {
  return getSession()?.token ?? null;
};
