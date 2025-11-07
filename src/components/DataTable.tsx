import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";

interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  selectedRowId?: string | number;
}

export function DataTable<T extends { id?: string | number }>({ 
  data, 
  columns,
  emptyMessage = "No data available",
  onRowClick,
  selectedRowId
}: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </Card>
    );
  }

  return (
    <Card className="border-border">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-border">
            {columns.map((column, idx) => (
              <TableHead key={idx} className="text-muted-foreground font-semibold">
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, rowIdx) => {
            const isSelected = row.id === selectedRowId;
            return (
              <TableRow 
                key={row.id || rowIdx} 
                className={`border-border transition-colors ${
                  onRowClick ? 'cursor-pointer hover:bg-primary/10' : 'hover:bg-sidebar-accent/50'
                } ${isSelected ? 'bg-primary/20 border-l-4 border-l-primary' : ''}`}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((column, colIdx) => (
                  <TableCell key={colIdx} className={column.className}>
                    {typeof column.accessor === "function"
                      ? column.accessor(row)
                      : String(row[column.accessor])}
                  </TableCell>
                ))}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Card>
  );
}
