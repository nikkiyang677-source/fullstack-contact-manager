import React from "react";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button, Stack, Chip
} from "@mui/material";

const ContactList = ({ contacts, updateContact, updateCallback }) => {
  const onDelete = async (id) => {
    try {
      const res = await fetch(`http://127.0.0.1:5000/delete_contact/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) updateCallback();
      else {
        const txt = await res.text();
        alert("Delete failed: " + txt);
      }
    } catch (e) {
      alert("Network error: " + e.message);
    }
  };

  return (
    <TableContainer component={Paper} elevation={2}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Address</TableCell>
            <TableCell>First Name</TableCell>
            <TableCell>Last Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Company</TableCell>
            <TableCell>Position</TableCell>
            <TableCell>Salary</TableCell>  
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {contacts.map((c) => (
            <TableRow key={c.id} hover>
              <TableCell sx={{ maxWidth: 220, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {c.address
                  ? `${c.address.street}, ${c.address.city}, ${c.address.country}`
                  : "N/A"}
              </TableCell>
              <TableCell>{c.firstName}</TableCell>
              <TableCell>{c.lastName}</TableCell>
              <TableCell>
                <Chip label={c.email} variant="outlined" size="small" />
              </TableCell>
              <TableCell>{c.company ? c.company.name : "N/A"}</TableCell>
              <TableCell>{c.position || "N/A"}</TableCell>
              <TableCell>{c.salary || "N/A"}</TableCell>
              <TableCell align="right">
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => updateContact(c)}
                  >
                    Update
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    variant="contained"
                    onClick={() => onDelete(c.id)}
                  >
                    Delete
                  </Button>
                </Stack>
              </TableCell>
            </TableRow>
          ))}

          {contacts.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} align="center" sx={{ py: 6, color: "text.secondary" }}>
                No contacts yet. Click “New Contact” to create one.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ContactList;