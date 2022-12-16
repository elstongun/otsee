import { useAccount } from 'wagmi'

import { Account, Connect, NetworkSwitcher } from './components'
import { Listings } from './components/Listings'
import Fonts from "./components/fonts";
import theme from "./components/theme";
import { ChakraProvider } from '@chakra-ui/react';

export function App() {
  const { isConnected } = useAccount()

  return (
    <>
      <ChakraProvider theme={theme}>
        <h1>wagmi + Vite</h1>

        <Connect />

        {isConnected && (
          <>
            <Account />
            <NetworkSwitcher />
            <Listings />
          </>
        )}
      </ChakraProvider>
    </>
  );
}
