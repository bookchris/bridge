import { Alert } from "@mui/material";
import { useErrorHandler } from "react-error-boundary";
import { useParams } from "react-router-dom";
import { TableContextProvider } from "../components/board/table";
import Loading from "../components/loading";
import { useTable } from "../lib/table";

export default function TablePage() {
  const { tableId } = useParams();
  if (!tableId) throw new Error("tableId not set");

  const [table, loading, error] = useTable(tableId);
  useErrorHandler(error);

  if (loading) return <Loading />;
  if (!table) return <Alert severity="error">table ${tableId} not found</Alert>;
  return <TableContextProvider table={table} />;
}
