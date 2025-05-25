import { TableRow, TableRowProps } from "@mui/material";
import {
  Children,
  ReactChild,
  ReactElement,
  ReactFragment,
  ReactPortal,
} from "react";

type Child = ReactChild | ReactFragment | ReactPortal;

export const TableRowGrouper = ({
  children,
  ...props
}: TableRowProps): ReactElement => {
  const cols = Children.toArray(children);
  const { rows, partial } = cols.reduce(
    (prev, col) => {
      const { rows = [] } = prev;
      let { partial = [] } = prev;
      partial = [...partial, col];
      if (partial.length >= 4) {
        rows.push(
          <TableRow key={rows.length} {...props}>
            {partial}
          </TableRow>,
        );
        partial = [];
      }
      return { rows: rows, partial: partial };
    },
    {} as { rows: Child[]; partial: Child[] },
  );

  rows.push(
    <TableRow key={rows.length} {...props}>
      {partial}
    </TableRow>,
  );
  return <>{rows}</>;
};
