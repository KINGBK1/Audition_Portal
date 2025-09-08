'use client'
import { useRef } from 'react'
import { Provider } from 'react-redux'
import { makeStore, AppStore } from '@/lib/store/store'

export default function StoreProvider({
    children,
}: {
    children: React.ReactNode
}) {
    const storeRef = useRef<AppStore>()
    if (!storeRef.current) {
        // Create the store instance the first time this renders
        storeRef.current = makeStore()
    }

    return <Provider store={storeRef.current}>{children}</Provider>
}

//Redux Persist Code
// 'use client';

// import { Provider } from 'react-redux';
// import React, { useRef } from 'react';
// import { type Persistor, persistStore } from 'redux-persist';
// import { PersistGate } from 'redux-persist/integration/react';
// import { type AppStore, makeStore } from '@/lib/store/store';

// interface StoreProviderProps {
//   children: React.ReactNode
// }

// const StoreProvider: React.FC<StoreProviderProps> = ({ children }) => {
//   const storeRef = useRef<AppStore>();
//   const persistorRef = useRef<Persistor>({} as Persistor);
//   if (!storeRef.current) {
//     storeRef.current = makeStore();
//     persistorRef.current = persistStore(storeRef.current);
//   }

//   return (
//     <Provider store={storeRef.current}>
//       <PersistGate loading={null} persistor={persistorRef.current}>
//         {children}
//       </PersistGate>
//     </Provider>
//   );
// };

// export default StoreProvider;