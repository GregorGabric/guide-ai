import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';

// import { onlineManager } from '@tanstack/react-query';
// import * as Network from 'expo-network';

// onlineManager.setEventListener((setOnline) => {
//   const eventSubscription = Network.addNetworkStateListener((state) => {
//     setOnline(!!state.isConnected);
//   });
//   return eventSubscription.remove;
// });

interface Props {
  children: ReactNode;
}
const queryClient = new QueryClient();

export function QueryProvider({ children }: Props) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
