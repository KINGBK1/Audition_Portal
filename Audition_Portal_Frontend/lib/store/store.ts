import { configureStore } from '@reduxjs/toolkit'
import authReducer from './features/auth/authSlice'
import { examReducer } from './features/exam/examSlice'

export const makeStore = () => {
  return configureStore({
    reducer: {
      auth: authReducer,
      exam: examReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ serializableCheck: true }),
  })
}

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']

//Redux Persist Code
// import { combineReducers, configureStore } from '@reduxjs/toolkit';
// import { FLUSH, PAUSE, PERSIST, PURGE, REGISTER, REHYDRATE, persistReducer, persistStore } from 'redux-persist';
// import { authReducer } from './features/auth/authSlice'
// import storage from '@/lib/ssr-safe-storage';

// const rootReducer = combineReducers({
//   auth: authReducer,
// });

// export const persistConfig = {
//   key: 'root',
//   storage,
//   whitelist: ['auth'],
// };

// const persistedReducer = persistReducer(persistConfig, rootReducer);

// export const makeStore = () => {
//   return configureStore({
//     reducer: persistedReducer,
//     devTools: process.env.NODE_ENV !== 'production',
//     middleware: (getDefaultMiddleware) =>
//       getDefaultMiddleware({
//         serializableCheck: {
//           ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
//         },
//       }),
//   });
// };

// export const store = makeStore();
// export const persistor = persistStore(store);

// export type AppStore = ReturnType<typeof makeStore>;
// export type RootState = ReturnType<AppStore['getState']>;
// export type AppDispatch = AppStore['dispatch'];