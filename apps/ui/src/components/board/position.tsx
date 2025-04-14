import { Card, Hand } from "@bridge/core";
import { StoredHand } from "@bridge/storage";
import { useCallback, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTableContext } from "./table";

interface State {
  position?: number;
}

export const usePosition = (hand: Hand) => {
  const location = useLocation();
  const { table } = useTableContext();
  const navigate = useNavigate();

  const state: State = location.state;
  const position = state.position || (table?.id ? hand.positions : 0);

  const [variation, setVariation] = useState([] as Card[]);

  const setPosition = useCallback(
    (p: number | ((prev: number) => number)) => {
      const newPosition = p instanceof Function ? p(position) : p;
      const newState = { ...location.state };
      if (
        (newPosition === hand.positions && table?.id) ||
        (newPosition === 0 && !table?.id)
      ) {
        delete newState["position"];
      } else {
        newState["position"] = newPosition;
      }
      navigate(location.pathname, { state: newState, replace: true });
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
  return { position, setPosition, variation, setVariation };
};

export function useNavigateToHand() {
  const location = useLocation();
  const navigate = useNavigate();
  return useCallback(
    (hand: StoredHand, position?: number) =>
      navigate(`/hands/${hand.id}`, {
        state: {
          ...location.state,
          position: position === undefined ? undefined : position,
        },
        replace: true,
      }),
    []
  );
}
