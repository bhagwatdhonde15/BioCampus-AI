import { useEffect, useRef, useState } from 'react';
import { GeolocationState } from '../types/plant';

export function useGeolocation(): GeolocationState {
  const [state, setState] = useState<GeolocationState>({
    lat: null,
    lng: null,
    accuracy: null,
    isWatching: false,
    error: null,
  });

  const watchIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        error: 'Geolocation is not supported by your browser.',
        isWatching: false,
      }));
      return;
    }

    setState((prev) => ({ ...prev, isWatching: true }));

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0,
    };

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        setState({
          lat: parseFloat(position.coords.latitude.toFixed(6)),
          lng: parseFloat(position.coords.longitude.toFixed(6)),
          accuracy: Math.round(position.coords.accuracy),
          isWatching: true,
          error: null,
        });
      },
      (err) => {
        let message = 'Location access failed.';
        if (err.code === err.PERMISSION_DENIED) message = 'Location permission denied. Please allow GPS access.';
        else if (err.code === err.POSITION_UNAVAILABLE) message = 'Location unavailable. Check GPS signal.';
        else if (err.code === err.TIMEOUT) message = 'GPS timed out. Retrying...';

        setState((prev) => ({
          ...prev,
          isWatching: false,
          error: message,
        }));
      },
      options
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  return state;
}
