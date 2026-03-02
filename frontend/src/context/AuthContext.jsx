import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { apiClient } from '../services/apiClient';

const TOKEN_KEY = 'studyhive_token';
const AuthContext = createContext(null);

const normalizeUser = (record = {}) => ({
  id: record.id,
  name: record.fullName || record.name || record.full_name,
  fullName: record.fullName || record.name || record.full_name,
  email: record.email,
  role: record.role || 'user',
  dept: record.departmentName || record.dept || record.department_name || 'N/A',
  departmentId: record.departmentId || record.department_id || null,
  departmentName: record.departmentName || record.department_name || record.dept || 'N/A',
  year: record.academicYear || record.year || record.academic_year || null,
  isActive: record.isActive ?? record.is_active ?? true,
  lastLoginAt: record.lastLoginAt || record.last_login_at || null,
  createdAt: record.createdAt || record.created_at || null,
});

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  const persistToken = useCallback((value) => {
    if (!value) {
      localStorage.removeItem(TOKEN_KEY);
    } else {
      localStorage.setItem(TOKEN_KEY, value);
    }
    setToken(value);
  }, []);

  const fetchProfile = useCallback(async () => {
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await apiClient.get('/auth/me', { token });
      setUser(normalizeUser(data.user));
    } catch (error) {
      console.warn('Failed to load profile:', error.message);
      persistToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [token, persistToken]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const login = async (email, password) => {
    const cleanEmail = email.trim();
    try {
      const data = await apiClient.post('/auth/login', { email: cleanEmail, password });
      persistToken(data.token);
      const normalized = normalizeUser(data.user);
      setUser(normalized);
      setAuthError(null);
      return { success: true, user: normalized };
    } catch (error) {
      setAuthError(error.message);
      return { success: false, message: error.message };
    }
  };

  const register = async ({ name, email, password, dept, year }) => {
    try {
      const payload = {
        fullName: name.trim(),
        email: email.trim(),
        password,
        departmentName: dept?.trim(),
        academicYear: year ? Number(year) : null,
      };
      const data = await apiClient.post('/auth/register', payload);
      persistToken(data.token);
      const normalized = normalizeUser(data.user);
      setUser(normalized);
      return { success: true, user: normalized };
    } catch (error) {
      setAuthError(error.message);
      return { success: false, message: error.message };
    }
  };

  const logout = () => {
    persistToken(null);
    setUser(null);
    setUsers([]);
    setAuthError(null);
  };

  const fetchUsers = useCallback(async () => {
    if (!token || user?.role !== 'admin') {
      setUsers([]);
      return;
    }
    try {
      const data = await apiClient.get('/users', { token });
      setUsers((data.users || []).map(normalizeUser));
    } catch (error) {
      console.warn('Failed to fetch users:', error.message);
    }
  }, [token, user]);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchUsers();
    }
  }, [user, fetchUsers]);

  const deleteUser = async (userId) => {
    if (!token || user?.role !== 'admin') return;
    await apiClient.del(`/users/${userId}`, { token });
    setUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  const updateUser = async (userId, updates) => {
    if (!token || user?.role !== 'admin') return;
    await apiClient.patch(`/users/${userId}`, updates, { token });
    // Refresh user list to get updated data
    await fetchUsers();
  };

  const value = useMemo(
    () => ({
      user,
      users,
      token,
      authLoading: loading,
      authError,
      login,
      register,
      logout,
      deleteUser,
      updateUser,
      refreshUsers: fetchUsers,
    }),
    [user, users, token, loading, authError, fetchUsers]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
