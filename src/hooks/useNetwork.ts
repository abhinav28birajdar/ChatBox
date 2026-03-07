import { useEffect, useState } from 'react';
import * as Network from 'expo-network';

export function useNetwork() {
    const [isConnected, setIsConnected] = useState<boolean | null>(true);
    const [isInternetReachable, setIsInternetReachable] = useState<boolean | null>(true);

    useEffect(() => {
        const checkNetwork = async () => {
            const state = await Network.getNetworkStateAsync();
            setIsConnected(state.isConnected ?? false);
            setIsInternetReachable(state.isInternetReachable ?? false);
        };

        checkNetwork();

        const timer = setInterval(checkNetwork, 10000); // Check every 10s

        return () => clearInterval(timer);
    }, []);

    return { isConnected, isInternetReachable };
}
