import { useState } from "react";

export function useLocalStorage(key, initialValue) {
  const savedValue = JSON.parse(localStorage.getItem(key));
  const [value, setValue] = useState(() => {
    if (savedValue === null) {
      localStorage.setItem(key, JSON.stringify(initialValue));
      return initialValue;
    } else {
      return savedValue;
    }
  });

  function setLocalValue(newValue) {
    setValue(newValue);
    localStorage.setItem(key, JSON.stringify(newValue));
  }

  return [value, setLocalValue];
}
