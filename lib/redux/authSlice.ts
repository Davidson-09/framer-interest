import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  token: string | null;
  userEmail: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  token: null,
  userEmail: null,
  isAuthenticated: false,
};

// Try to load state from localStorage if available (client-side only)
if (typeof window !== 'undefined') {
  const savedToken = localStorage.getItem('pinterest_token');
  const savedEmail = localStorage.getItem('pinterest_user_email');
  
  if (savedToken) {
    initialState.token = savedToken;
    initialState.isAuthenticated = true;
  }
  
  if (savedEmail) {
    initialState.userEmail = savedEmail;
  }
}

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ token: string; userEmail: string }>
    ) => {
      const { token, userEmail } = action.payload;
      state.token = token;
      state.userEmail = userEmail;
      state.isAuthenticated = true;
      
      // Also save to localStorage for persistence
      if (typeof window !== 'undefined') {
        localStorage.setItem('pinterest_token', token);
        localStorage.setItem('pinterest_user_email', userEmail);
      }
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      state.isAuthenticated = true;
      
      // Also save to localStorage for persistence
      if (typeof window !== 'undefined') {
        localStorage.setItem('pinterest_token', action.payload);
      }
    },
    setUserEmail: (state, action: PayloadAction<string>) => {
      state.userEmail = action.payload;
      
      // Also save to localStorage for persistence
      if (typeof window !== 'undefined') {
        localStorage.setItem('pinterest_user_email', action.payload);
      }
    },
    logout: (state) => {
      state.token = null;
      state.userEmail = null;
      state.isAuthenticated = false;
      
      // Clear localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('pinterest_token');
        localStorage.removeItem('pinterest_user_email');
      }
    },
  },
});

export const { setCredentials, setToken, setUserEmail, logout } = authSlice.actions;

export default authSlice.reducer;
