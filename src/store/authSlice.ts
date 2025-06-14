
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { supabase, organizationOperations } from '@/lib/supabase';

interface AuthState {
  user: any | null;
  session: any | null;
  organization: any | null;
  loading: boolean;
  needsOrgSetup: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  session: null,
  organization: null,
  loading: true,
  needsOrgSetup: false,
  error: null,
};

// Async thunks
export const initializeAuth = createAsyncThunk(
  'auth/initialize',
  async (_, { rejectWithValue }) => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      
      let organization = null;
      let needsOrgSetup = false;
      
      if (session?.user) {
        try {
          organization = await organizationOperations.getUserOrganization();
        } catch (error) {
          needsOrgSetup = true;
        }
      }
      
      return {
        session,
        user: session?.user || null,
        organization,
        needsOrgSetup
      };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const createOrganization = createAsyncThunk(
  'auth/createOrganization',
  async ({ name, userEmail }: { name: string; userEmail: string }, { rejectWithValue }) => {
    try {
      const organization = await organizationOperations.create(name, userEmail);
      return organization;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setSession: (state, action: PayloadAction<any>) => {
      state.session = action.payload;
      state.user = action.payload?.user || null;
    },
    setOrganization: (state, action: PayloadAction<any>) => {
      state.organization = action.payload;
      state.needsOrgSetup = false;
    },
    setNeedsOrgSetup: (state, action: PayloadAction<boolean>) => {
      state.needsOrgSetup = action.payload;
    },
    clearAuth: (state) => {
      state.user = null;
      state.session = null;
      state.organization = null;
      state.needsOrgSetup = false;
      state.error = null;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initializeAuth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.session = action.payload.session;
        state.organization = action.payload.organization;
        state.needsOrgSetup = action.payload.needsOrgSetup;
      })
      .addCase(initializeAuth.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createOrganization.fulfilled, (state, action) => {
        state.organization = action.payload;
        state.needsOrgSetup = false;
      })
      .addCase(createOrganization.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { setSession, setOrganization, setNeedsOrgSetup, clearAuth, setError } = authSlice.actions;
export default authSlice.reducer;
