import { useLocalStorage } from "./useLocalStorage";

export function useSoundEffects() {
  const [isOn, setIsOn] = useLocalStorage("sound", false);
  function toggle() {
    setIsOn(!isOn);
  }

  // todo SOUND: actual effects

  return { isOn, toggle };
}
