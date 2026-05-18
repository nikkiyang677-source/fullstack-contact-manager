import { useState, useEffect } from "react";
import ContactList from "./ContactList";
import ContactForm from "./ContactForm";
import {
  AppBar, Toolbar, Typography, Container, Button, Dialog, DialogTitle, DialogContent
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";


function App() {
  const [contacts, setContacts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentContact, setCurrentContact] = useState({});

  useEffect(() => { fetchContacts(); }, []);

  const fetchContacts = async () => {
    const res = await fetch("http://127.0.0.1:5000/contacts");
    const data = await res.json();
    setContacts(data.contacts || []);
  };

  const openCreateModal = () => { setCurrentContact({}); setIsModalOpen(true); };
  const openEditModal = (contact) => { setCurrentContact(contact); setIsModalOpen(true); };
  const closeModal = () => setIsModalOpen(false);

  const onUpdate = () => { closeModal(); fetchContacts(); };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>Contacts</Typography>
          <Button color="inherit" startIcon={<AddIcon />} onClick={openCreateModal}>
            New Contact
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <ContactList contacts={contacts} updateContact={openEditModal} updateCallback={onUpdate} />
      </Container>

      <Dialog open={isModalOpen} onClose={closeModal} fullWidth maxWidth="sm">
        <DialogTitle>{Object.keys(currentContact).length ? "Update Contact" : "Create Contact"}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <ContactForm existingContact={currentContact} updateCallback={onUpdate} />
        </DialogContent>
      </Dialog>
    </>
  );
}

export default App;