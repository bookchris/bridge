import { Hand } from "@bridge/core";
import {
  Box,
  Icon,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from "react";
//import { useCurrentUser } from "../auth/auth";
//import { useRedeal, useStand } from "../db/table";
import { useTableContext } from "./table";

export interface ControlsProps {
  hand: Hand;
  position: number;
  setPosition: Dispatch<SetStateAction<number>>;
}

export function Controls({ hand, position, setPosition }: ControlsProps) {
  //const user = useCurrentUser();
  //const stand = useStand();
  //const redeal = useRedeal();
  const { table, playingAs } = useTableContext();

  const prev = useCallback(
    () => setPosition((p) => Math.max(0, p - 1)),
    [setPosition]
  );
  const next = useCallback(
    () => setPosition((p) => Math.min(hand.positions, p + 1)),
    [hand.positions, setPosition]
  );
  const prevPosition = hand.previousTurn(position);
  const prevSeat = useCallback(
    () => setPosition((p) => (prevPosition >= 0 ? prevPosition : p)),
    [prevPosition, setPosition]
  );
  const nextPosition = hand.nextTurn(position);
  const nextSeat = useCallback(
    () => setPosition((p) => (nextPosition >= 0 ? nextPosition : p)),
    [nextPosition, setPosition]
  );

  const [anchorEl, setAnchorEl] = useState<HTMLElement>();

  useEffect(() => {
    const onKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowLeft":
          prev();
          break;
        case "ArrowRight":
          next();
          break;
        case "ArrowUp":
          prevSeat();
          break;
        case "ArrowDown":
          nextSeat();
          break;
      }
    };
    document.addEventListener("keydown", onKeyPress);
    return () => document.removeEventListener("keydown", onKeyPress);
  }, [next, nextSeat, prev, prevSeat]);

  return (
    <Paper square>
      <Paper square elevation={0} sx={{ backgroundColor: "secondary.main" }}>
        <Typography sx={{ p: 1, color: "white" }}>Controls</Typography>
      </Paper>
      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Tooltip title="Hand start">
          <span>
            <IconButton
              onClick={() => setPosition(0)}
              disabled={position === 0}
            >
              <Icon>first_page</Icon>
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="Previous in seat">
          <span>
            <IconButton onClick={prevSeat} disabled={prevPosition === -1}>
              <Icon>expand_less</Icon>
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="Previous">
          <span>
            <IconButton onClick={prev} disabled={position === 0}>
              <Icon>navigate_before</Icon>
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="Next">
          <span>
            <IconButton onClick={next} disabled={position === -1}>
              <Icon>chevron_right</Icon>
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="Next in seat">
          <span>
            <IconButton
              onClick={nextSeat}
              disabled={position + 4 > hand.positions}
            >
              <Icon>expand_more</Icon>
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title={table ? "Live" : "Hand end"}>
          <span>
            <IconButton
              onClick={() => setPosition(hand.positions)}
              disabled={position === hand.positions}
            >
              <Icon>last_page</Icon>
            </IconButton>
          </span>
        </Tooltip>
        {table && (
          <div>
            <Menu
              anchorEl={anchorEl}
              open={!!anchorEl}
              onClose={() => setAnchorEl(undefined)}
              onClick={() => setAnchorEl(undefined)}
            >
              {[
                <MenuItem
                  key="redeal"
                  onClick={() => {
                    //redeal();
                    setPosition(0);
                  }}
                >
                  Redeal
                </MenuItem>,
                playingAs && (
                  <MenuItem
                    key="leave"
                    onClick={() => {} /*stand(user?.uid || "")*/}
                  >
                    Leave Seat
                  </MenuItem>
                ),
              ]}
            </Menu>
            <Tooltip title="Menu">
              <span>
                <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
                  <Icon>menu</Icon>
                </IconButton>
              </span>
            </Tooltip>
          </div>
        )}
      </Box>
    </Paper>
  );
}
