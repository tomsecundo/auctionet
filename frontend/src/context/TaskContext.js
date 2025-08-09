import React, { createContext, useContext, useEffect, useMemo, useReducer, useCallback } from 'react';
import { useAuth } from './AuthContext';

const TaskContext = createContext();

const initialState = {
  items: [],
  loading: false,
  error: null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'START':
      return { ...state, loading: true, error: null };
    case 'ERROR':
      return { ...state, loading: false, error: action.error || 'Something went wrong' };
    case 'SET':
      return { items: action.payload, loading: false, error: null };
    case 'ADD':
      return { items: [action.payload, ...state.items], loading: false, error: null };
    case 'UPDATE':
      return {
        items: state.items.map(t => (t.id === action.payload.id ? action.payload : t)),
        loading: false,
        error: null,
      };
    case 'DELETE':
      return {
        items: state.items.filter(t => t.id !== action.payload),
        loading: false,
        error: null,
      };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

const API_BASE = import.meta?.env?.VITE_API_BASE || process.env.REACT_APP_API_BASE || '';

export const TaskProvider = ({ children }) => {
  const { user, logout } = useAuth(); // user should contain { token, ... }
  const [state, dispatch] = useReducer(reducer, initialState);

  const authHeaders = useMemo(() => {
    if (!user?.token) return {};
    return { Authorization: `Bearer ${user.token}` };
  }, [user]);

  // central fetch wrapper
  const request = useCallback(
    async (path, opts = {}) => {
      const res = await fetch(`${API_BASE}/api/${path}`, {
        ...opts,
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
          ...(opts.headers || {}),
        },
      });

      // If token is invalid/expired, log out gracefully
      if (res.status === 401) {
        try {
          const data = await res.json().catch(() => ({}));
          dispatch({ type: 'ERROR', error: data?.message || 'Not authorized' });
        } finally {
          logout?.();
        }
        throw new Error('Unauthorized');
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || `Request failed: ${res.status}`);
      }

      return res.json();
    },
    [authHeaders, logout]
  );

  // CRUD actions
  const fetchTasks = useCallback(async () => {
    if (!user?.token) {
      dispatch({ type: 'RESET' });
      return;
    }
    dispatch({ type: 'START' });
    try {
      const data = await request('tasks');
      dispatch({ type: 'SET', payload: data });
    } catch (err) {
      dispatch({ type: 'ERROR', error: err.message });
    }
  }, [user, request]);

  const addTask = useCallback(
    async ({ title, description, deadline }) => {
      dispatch({ type: 'START' });
      try {
        const data = await request('tasks', {
          method: 'POST',
          body: JSON.stringify({ title, description, deadline }),
        });
        dispatch({ type: 'ADD', payload: data });
        return data;
      } catch (err) {
        dispatch({ type: 'ERROR', error: err.message });
        throw err;
      }
    },
    [request]
  );

  const updateTask = useCallback(
    async (id, patch) => {
      dispatch({ type: 'START' });
      try {
        const data = await request(`tasks/${id}`, {
          method: 'PUT',
          body: JSON.stringify(patch),
        });
        dispatch({ type: 'UPDATE', payload: data });
        return data;
      } catch (err) {
        dispatch({ type: 'ERROR', error: err.message });
        throw err;
      }
    },
    [request]
  );

  const deleteTask = useCallback(
    async (id) => {
      // optimistic remove
      const prev = state.items;
      dispatch({ type: 'DELETE', payload: id });
      try {
        await request(`tasks/${id}`, { method: 'DELETE' });
      } catch (err) {
        // rollback if failed
        dispatch({ type: 'SET', payload: prev });
        dispatch({ type: 'ERROR', error: err.message });
        throw err;
      }
    },
    [request, state.items]
  );

  // Auto-load tasks when user logs in/out
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const value = {
    tasks: state.items,
    loading: state.loading,
    error: state.error,
    fetchTasks,
    addTask,
    updateTask,
    deleteTask,
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};

export const useTasks = () => useContext(TaskContext);