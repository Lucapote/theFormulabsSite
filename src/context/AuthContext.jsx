import { createContext, useContext, useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const AuthContext = createContext({
  user: null,
  session: null,
  loading: true,
  login: async () => {},
  logout: async () => {}
});

// Default 15 minutes inactivity timeout
const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const inactivityTimerRef = useRef(null);

  const logout = async (reason = null) => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }

    if (supabase) {
      const { error } = await supabase.auth.signOut();
      if (error) console.error("Error signing out:", error.message);
    }

    setUser(null);
    setSession(null);

    if (reason === "inactivity") {
      toast.error("Tu sesión ha caducado por inactividad (15 min). Por favor inicia sesión de nuevo.");
    }
  };

  // Reset inactivity timer on user interaction
  const resetInactivityTimer = () => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }

    if (user) {
      inactivityTimerRef.current = setTimeout(() => {
        logout("inactivity");
      }, INACTIVITY_TIMEOUT_MS);
    }
  };

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    // Fetch current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    }).catch(() => setLoading(false));

    // Listen for auth state changes
    const { data: { subscription } = {} } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription?.unsubscribe();
  }, []);

  // Set up activity event listeners when user is logged in
  useEffect(() => {
    if (!user) {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      return;
    }

    // Start timer initially
    resetInactivityTimer();

    const activityEvents = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    const handleUserActivity = () => resetInactivityTimer();

    activityEvents.forEach((evt) => {
      window.addEventListener(evt, handleUserActivity);
    });

    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      activityEvents.forEach((evt) => {
        window.removeEventListener(evt, handleUserActivity);
      });
    };
  }, [user]);

  const login = async (email, password) => {
    if (!supabase) {
      throw new Error("La autenticación requiere configurar SUPABASE_URL y SUPABASE_ANON_KEY.");
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    return data;
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
