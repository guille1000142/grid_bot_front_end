import * as React from "react";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";

const columns = [
  { id: "name", label: "Pair", minWidth: 50, align: "left" },
  {
    id: "amount",
    label: "Amount",
    minWidth: 50,
    align: "left",
    format: (value) => value.toLocaleString("en-US"),
  },
  {
    id: "entry",
    label: "Entry Price",
    minWidth: 50,
    align: "left",
    format: (value) => value.toLocaleString("en-US"),
  },
  {
    id: "exit",
    label: "Exit Price",
    minWidth: 50,
    align: "left",
    format: (value) => value.toFixed(2),
  },
  {
    id: "closed",
    label: "Closed P&L",
    minWidth: 50,
    align: "left",
    format: (value) => value.toFixed(2),
  },
  {
    id: "time",
    label: "UTC Time",
    minWidth: 50,
    align: "left",
  },
];

function createData(name, amount, entry, exit, closed, time) {
  return { name, amount, entry, exit, closed, time };
}

const rows = [
  createData("India", "IN", 1324171354, 3287263, 20, "16:00"),
  createData("China", "CN", 1403500365, 9596961, 20, "16:00"),
  createData("Italy", "IT", 60483973, 301340, 20, "16:00"),
  createData("United States", "US", 327167434, 9833520, 40, "16:00"),
  createData("Canada", "CA", 37602103, 9984670, 20, "16:00"),
  createData("Australia", "AU", 25475400, 7692024, 20, "16:00"),
  createData("Germany", "DE", 83019200, 357578, 20, "16:00"),
  createData("Ireland", "IE", 4857000, 70273, 20, "16:00"),
  createData("Mexico", "MX", 126577691, 1972550, 20, "16:00"),
  createData("Japan", "JP", 12635000, 377973, 20, "16:00"),
  createData("France", "FR", 67022000, 640679, 20, "16:00"),
  createData("United Kingdom", "GB", 67545757, 242495, 40, "16:00"),
  createData("Russia", "RU", 146793744, 5098246, 20, "16:00"),
  createData("Nigeria", "NG", 200962417, 923768, 20, "16:00"),
  createData("Brazil", "BR", 210147125, 8515767, 20, "16:00"),
];

export default function BottomPanel() {
  return (
    <>
      <TableContainer sx={{ maxHeight: "100%" }}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  style={{ minWidth: column.minWidth }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.slice(12).map((row) => {
              return (
                <TableRow hover role="checkbox" tabIndex={-1} key={row.code}>
                  {columns.map((column) => {
                    const value = row[column.id];
                    return (
                      <TableCell key={column.id} align={column.align}>
                        {column.format && typeof value === "number"
                          ? column.format(value)
                          : value}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}
