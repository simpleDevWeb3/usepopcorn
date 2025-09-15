import { useEffect } from "react";
export function useKey(key, callBack) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.code.toLowerCase() === key.toLowerCase()) {
        callBack?.();
      }
    }
    document.addEventListener("keydown", handleKeyDown);

    return function () {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [callBack, key]);
}
