import { Alert } from "@mui/material";
import { useErrorHandler } from "react-error-boundary";
import { CardStack } from "../components/cardStack";
import Loading from "../components/loading";
import { TableCard } from "../components/tableCard";
import { useTableList } from "../lib/table";

export default function TablesPage() {
  const [tables, loading, error] = useTableList();
  useErrorHandler(error);

  if (loading) return <Loading />;
  if (!tables) {
    return <Alert severity="error">There are no active tables right now</Alert>;
  }
  return (
    <CardStack>
      {tables.map((table) => (
        <TableCard key={table.id} table={table} />
      ))}
    </CardStack>
  );
}
