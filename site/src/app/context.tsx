import { create } from 'zustand';

interface User {
  id: string;
  username: string;
  is_email_verified: boolean;
}

interface SharedState {
  session: {
    authorization: string | null;
    user: User | null;
  }
}

export const useSharedState = create<SharedState>(set => ({
  session: {
    authorization: null,
    user: null,
  },
}));
