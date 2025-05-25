import { AllSeats, Bid, Card, Seat } from "@bridge/core";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useErrorHandler } from "react-error-boundary";
import { Table, useBid, usePlay } from "../../lib/table";
import { useUserContext } from "../../lib/user";
import { Board } from "./board";

interface TableContextType {
  table?: Table;
  playingAs?: Seat;
  bid?: (bid: Bid) => Promise<void>;
  play?: (card: Card) => Promise<void>;
}

const TableContext = createContext<TableContextType>({});

export const useTableContext = () => useContext(TableContext);

export function TableContextProvider({ table }: { table: Table }) {
  const { user } = useUserContext();
  const playerIndex = table?.uids.indexOf(user?.uid || "") ?? -1;
  const playingAs = playerIndex === -1 ? undefined : AllSeats[playerIndex];

  const [pre, setPre] = useState<Table>();
  useEffect(() => {
    if (pre && pre.positions <= table.positions) {
      setPre(undefined);
    }
  }, [pre, table]);

  const [bid, , bidError] = useBid(table.id);
  useErrorHandler(bidError);
  const preBid = useCallback(
    async (b: Bid) => {
      if (playingAs) {
        const newHand = table.doBid(b, playingAs);
        if (newHand) {
          setPre(table.updateHand(newHand));
          await bid(b);
        }
      }
    },
    [bid, playingAs, table],
  );

  const [play, , playError] = usePlay(table.id);
  useErrorHandler(playError);
  const prePlay = useCallback(
    async (c: Card) => {
      if (playingAs) {
        const newHand = table.doPlay(c, playingAs);
        if (newHand) {
          setPre(table.updateHand(newHand));
          await play(c);
        }
      }
    },
    [play, playingAs, table],
  );

  const value: TableContextType = useMemo(
    () => ({
      table: pre || table,
      playingAs: playingAs,
      bid: preBid,
      play: prePlay,
    }),
    [playingAs, pre, preBid, prePlay, table],
  );

  return (
    <TableContext.Provider value={value}>
      <Board hand={pre || table} playingAs={playingAs} live />
    </TableContext.Provider>
  );
}
