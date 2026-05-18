import { useState } from "react";
import { TextField, Button, Box } from "@mui/material";

const ContactForm = ({ existingContact = {}, updateCallback }) => {
  const [firstName, setFirstName] = useState(existingContact.firstName || "");
  const [lastName, setLastName] = useState(existingContact.lastName || "");
  const [email, setEmail] = useState(existingContact.email || "");
  const [companyName, setCompanyName] = useState(existingContact.company?.name || "");
  const [position, setPosition] = useState(existingContact.position || "");
  const [street, setStreet] = useState(existingContact.address?.street || "");
  const [city, setCity] = useState(existingContact.address?.city || "");
  const [country, setCountry] = useState(existingContact.address?.country || "");
  const [emailError, setEmailError] = useState("");

  const updating = Object.keys(existingContact).length > 0;

  const validateEmail = (v) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setEmailError(re.test(v) ? "" : "Invalid email format");
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!email) { setEmailError("Email is required"); return; }
    if (emailError) { alert("Please fix errors before submitting."); return; }

    const data = { firstName, lastName, email, companyName, position, street, city, country };
    const url = "http://127.0.0.1:5000/" + (updating ? `update_contact/${existingContact.id}` : "create_contact");

    try {
      const res = await fetch(url, {
        method: updating ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) updateCallback();
      else {
        const txt = await res.text();
        alert("Error: " + txt);
      }
    } catch (err) {
      alert("Network error: " + err.message);
    }
  };

  return (
    <Box component="form" onSubmit={onSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <TextField label="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
      <TextField label="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
      <TextField
        label="Email" value={email}
        onChange={(e) => { setEmail(e.target.value); validateEmail(e.target.value); }}
        onBlur={(e) => validateEmail(e.target.value)}
        error={!!emailError} helperText={emailError} required
      />
      <TextField label="Company Name" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
      <TextField label="Position" value={position} onChange={(e) => setPosition(e.target.value)}/>
      <TextField label="Street" value={street} onChange={(e) => setStreet(e.target.value)} />
      <TextField label="City" value={city} onChange={(e) => setCity(e.target.value)} />
      <TextField label="Country" value={country} onChange={(e) => setCountry(e.target.value)} />
      <Button type="submit" variant="contained" disabled={!!emailError}>
        {updating ? "Update Contact" : "Create Contact"}
      </Button>
    </Box>
  );
};

export default ContactForm;