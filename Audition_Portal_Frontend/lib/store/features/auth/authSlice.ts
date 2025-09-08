// src/lib/store/features/auth/authSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

//
// 1) Define the UserInfo interface. It must match exactly what your backend returns.
//
interface UserInfo {
  id: string;
  email: string;
  username: string;
  picture: string;
  role: "ADMIN" | "USER";
  contact?: string;
  gender?: string;
  specialization?: string;
}

interface AuthState {
  userInfo: UserInfo | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: AuthState = {
  userInfo: null,
  status: "idle",
  error: null,
};

//
// 2) Thunk: verifyToken → GET /auth/verify
//
export const verifyToken = createAsyncThunk<
  UserInfo,   // Return type
  void,       // No argument
  { rejectValue: string }
>(
  "auth/verifyToken",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/verify`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Unauthorized");
      }

      const data = await response.json();
      if (!data || typeof data !== "object") {
        throw new Error("Malformed response from /auth/verify");
      }

      return data as UserInfo;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

//
// 3) Thunk: fetchUserData → GET /api/user
//
export const fetchUserData = createAsyncThunk<
  UserInfo,
  void,
  { rejectValue: string }
>(
  "auth/fetchUserData",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }

      const data = await response.json();
      if (!data || typeof data !== "object") {
        throw new Error("Malformed response from /api/user");
      }

      return data as UserInfo;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

//
// 4) Thunk: updateUserInfo → PUT /api/update-user-info
//
export const updateUserInfo = createAsyncThunk<
  UserInfo,
  { contact: string; gender: string; specialization: string },
  { rejectValue: string }
>(
  "auth/updateUserInfo",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/update-user-info`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update user info");
      }

      const data = await response.json();
      if (!data || typeof data !== "object") {
        throw new Error("Malformed response from PUT /api/update-user-info");
      }

      return data as UserInfo;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

//
// 5) Create the auth slice
//
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.userInfo = null;
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // verifyToken
      .addCase(verifyToken.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(verifyToken.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.userInfo = action.payload;
      })
      .addCase(verifyToken.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
        state.userInfo = null;
      });

    builder
      // fetchUserData
      .addCase(fetchUserData.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchUserData.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.userInfo = action.payload;
      })
      .addCase(fetchUserData.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
        state.userInfo = null;
      });

    builder
      // updateUserInfo
      .addCase(updateUserInfo.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateUserInfo.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.userInfo = action.payload;
      })
      .addCase(updateUserInfo.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

export const { logout } = authSlice.actions;
export const selectAuthState = (state: any) => state.auth;
export default authSlice.reducer;
