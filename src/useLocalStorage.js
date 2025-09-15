import { useState, useEffect } from "react";
export function useLocalStorage(initialState, key) {
  const [value, setValue] = useState(function () {
    const data = JSON.parse(localStorage.getItem(key));
    return data ?? initialState;
  });

  useEffect(
    function () {
      localStorage.setItem("watched", JSON.stringify(value));
    },
    [value, key]
  );

  return [value, setValue];
}
