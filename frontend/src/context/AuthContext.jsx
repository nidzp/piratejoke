import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { toast } from 'react-hot-toast';
import {
  addWatchlistItem,
  fetchCurrentUser,
  getWatchlist,
  loginUser,
  purchaseTokens,
  registerUser,
  removeWatchlistItem,
} from '../api.js';
import { setAuthToken, clearAuthToken } from '../apiClient.js';

const AuthContext = createContext(undefined);

const TOKEN_STORAGE_KEY = 'piratejoke.jwt';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [watchlist, setWatchlist] = useState([]);
  const [initializing, setInitializing] = useState(true);

  const updateTokenStorage = useCallback((token) => {
    if (token) {
      window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
      setAuthToken(token);
    } else {
      window.localStorage.removeItem(TOKEN_STORAGE_KEY);
      clearAuthToken();
    }
  }, []);

  const refreshWatchlist = useCallback(async () => {
    if (!user) {
      return [];
    }
    const response = await getWatchlist();
    setWatchlist(response.items || []);
    return response.items || [];
  }, [user]);

  const logout = useCallback(() => {
    setUser(null);
    setWatchlist([]);
    updateTokenStorage(null);
    toast('Odjavljeni ste.');
  }, [updateTokenStorage]);

  useEffect(() => {
    const token = window.localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!token) {
      setInitializing(false);
      return;
    }

    setAuthToken(token);
    fetchCurrentUser()
      .then(({ user: profile }) => {
        setUser(profile);
        return refreshWatchlist();
      })
      .catch((error) => {
        console.warn('Session restore failed:', error.message);
        logout();
      })
      .finally(() => setInitializing(false));
  }, [logout, refreshWatchlist]);

  const login = useCallback(
    async ({ email, password }) => {
      const { user: profile, token } = await loginUser({ email, password });
      setUser(profile);
      updateTokenStorage(token);
      await refreshWatchlist();
      toast.success(`Dobrodošao nazad, ${profile.displayName || profile.email}!`);
      return profile;
    },
    [updateTokenStorage, refreshWatchlist]
  );

  const register = useCallback(
    async ({ name, email, password }) => {
      const { user: profile, token } = await registerUser({ name, email, password });
      setUser(profile);
      updateTokenStorage(token);
      await refreshWatchlist();
      toast.success('Uspešno ste kreirali nalog!');
      return profile;
    },
    [updateTokenStorage, refreshWatchlist]
  );

  const isInWatchlist = useCallback(
    (tmdbId) =>
      watchlist.some((item) => String(item.tmdbId || item.tmdb_id) === String(tmdbId)),
    [watchlist]
  );

  const addToWatchlist = useCallback(
    async ({ tmdbId, title, mediaType, posterUrl }) => {
      const { item } = await addWatchlistItem({
        tmdbId,
        title,
        mediaType,
        posterUrl,
      });
      setWatchlist((prev) => {
        const filtered = prev.filter(
          (entry) => String(entry.tmdbId || entry.tmdb_id) !== String(tmdbId)
        );
        return [item, ...filtered];
      });
      toast.success(`„${title}“ je dodat na watchlistu.`);
      return item;
    },
    []
  );

  const removeFromWatchlist = useCallback(async ({ tmdbId, title }) => {
    await removeWatchlistItem(tmdbId);
    setWatchlist((prev) =>
      prev.filter((entry) => String(entry.tmdbId || entry.tmdb_id) !== String(tmdbId))
    );
    toast.success(`„${title}“ je uklonjen sa watchliste.`);
  }, []);

  const updateTokenBalance = useCallback((tokens) => {
    setUser((prev) => (prev ? { ...prev, tokens } : prev));
  }, []);

  const buyTokens = useCallback(
    async ({ packageId }) => {
      const response = await purchaseTokens({ packageId, mock: true });
      updateTokenBalance(response.tokens);
      toast.success('Tokeni su uspešno dopunjeni!');
      return response;
    },
    [updateTokenBalance]
  );

  const value = useMemo(
    () => ({
      user,
      watchlist,
      initializing,
      login,
      register,
      logout,
      refreshWatchlist,
      isInWatchlist,
      addToWatchlist,
      removeFromWatchlist,
      updateTokenBalance,
      buyTokens,
    }),
    [
      user,
      watchlist,
      initializing,
      login,
      register,
      logout,
      refreshWatchlist,
      isInWatchlist,
      addToWatchlist,
      removeFromWatchlist,
      updateTokenBalance,
      buyTokens,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
