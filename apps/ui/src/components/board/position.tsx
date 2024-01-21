import { Hand } from "@bridge/core";
import { useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTableContext } from "./table";

export const usePosition = (hand: Hand) => {
  const location = useLocation();
  //const { push, query, pathname } = useRouter();
  //const query = { position: "" };
  //const pathname = "";
  //const push = "";
  const { table } = useTableContext();
  const navigate = useNavigate();

  const first = (v: string | string[] | undefined) =>
    Array.isArray(v) ? v[0] : v;
  let position = parseInt(first(location.state?.position) || "");
  if (isNaN(position)) position = table?.id ? hand.positions : 0;

  const setPosition = useCallback(
    (p: number | ((prev: number) => number)) => {
      const newPosition = p instanceof Function ? p(position) : p;
      const newState = { ...location.state };
      //const newQuery = { ...query };
      if (
        (newPosition === hand.positions && table?.id) ||
        (newPosition === 0 && !table?.id)
      ) {
        delete newState["position"];
      } else {
        newState["position"] = newPosition.toString();
      }
      navigate(location.pathname, { state: newState, replace: true });
      //push({ pathname: pathname, query: newQuery });
    },
    [
      hand.positions,
      location.pathname,
      location.state,
      navigate,
      position,
      table?.id,
    ]
  );
  return { position: position, setPosition: setPosition };
};
