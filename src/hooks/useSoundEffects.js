import { useLocalStorage } from "./useLocalStorage";

export function useSoundEffects() {
  const [isOn, setIsOn] = useLocalStorage("sound", false);
  function toggle() {
    setIsOn(!isOn);
  }

  // ! (basic) sound effects

  return { isOn, toggle };
}
