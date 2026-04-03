import React, { createContext, useCallback, useContext, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../services/apiClient';

const TOKEN_KEY = 'studyhive_token';
const AuthContext = createContext(null);

const normalizeUser = (record = {}) => ({
  id: record.id || record._id,
  name: record.fullName || record.name || record.full_name,
  fullName: record.fullName || record.name || record.full_name,
  email: record.email,
  role: record.role || 'student',
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
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const queryClient = useQueryClient();
  const token = localStorage.getItem(TOKEN_KEY) || null;

  const persistToken = useCallback((value) => {
    if (!value) localStorage.removeItem(TOKEN_KEY);
    else localStorage.setItem(TOKEN_KEY, value);
  }, []);

  // 1. Profile Query (Automatic Fetch & Cache)
  const { data: user, isLoading: authLoading, error: profileError } = useQuery({
    queryKey: ['authProfile'],
    queryFn: async () => {
      if (!token) return null;
      const data = await apiClient.get('/auth/me', { token });
      return normalizeUser(data.user);
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
    retry: false,
    onError: () => persistToken(null),
  });

  // 2. Admin Users Query
  const { data: users = [], refetch: refreshUsers } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      if (!token || user?.role !== 'admin') return [];
      const data = await apiClient.get('/users', { token });
      return (data.users || []).map(normalizeUser);
    },
    enabled: !!user && user.role === 'admin',
  });

  // 3. Login Mutation
  const loginMutation = useMutation({
    mutationFn: async ({ email, password }) => {
      const data = await apiClient.post('/auth/login', { email: email.trim(), password });
      return data;
    },
    onSuccess: (data) => {
      persistToken(data.token);
      queryClient.setQueryData(['authProfile'], normalizeUser(data.user));
    },
  });

  // 4. Register Mutation
  const registerMutation = useMutation({
    mutationFn: async ({ name, email, password, dept, year }) => {
      const payload = {
        fullName: name.trim(),
        email: email.trim(),
        password,
        departmentName: dept?.trim(),
        academicYear: year ? Number(year) : null,
      };
      return await apiClient.post('/auth/register', payload);
    },
    onSuccess: (data) => {
      persistToken(data.token);
      queryClient.setQueryData(['authProfile'], normalizeUser(data.user));
    },
  });

  // 5. Admin User Mutations
  const deleteUserMutation = useMutation({
    mutationFn: async (userId) => apiClient.del(`/users/${userId}`, { token }),
    onSuccess: () => queryClient.invalidateQueries(['users']),
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, updates }) => apiClient.patch(`/users/${userId}`, updates, { token }),
    onSuccess: () => queryClient.invalidateQueries(['users']),
  });

  // Legacy API wrapper to not break existing UI components immediately
  const login = async (email, password) => {
    try {
      const data = await loginMutation.mutateAsync({ email, password });
      return { success: true, user: normalizeUser(data.user) };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const register = async (params) => {
    try {
      const data = await registerMutation.mutateAsync(params);
      return { success: true, user: normalizeUser(data.user) };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const logout = () => {
    persistToken(null);
    queryClient.setQueryData(['authProfile'], null);
    queryClient.clear();
  };

  const value = useMemo(
    () => ({
      user,
      users,
      token,
      authLoading,
      authError: loginMutation.error?.message || registerMutation.error?.message || profileError?.message,
      login,
      register,
      logout,
      deleteUser: (id) => deleteUserMutation.mutate(id),
      updateUser: (id, updates) => updateUserMutation.mutate({ userId: id, updates }),
      refreshUsers,
    }),
    [user, users, token, authLoading, profileError, loginMutation.error, registerMutation.error, refreshUsers]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
