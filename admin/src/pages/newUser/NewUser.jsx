import React, { useState, useContext } from "react";
import "./newUser.css";
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import { createUser } from "../../context/userContext/apiCalls"; 
import { UserContext } from "../../context/userContext/UserContext"; 
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx'; // Import the xlsx library

export default function NewUser() {
  const [user, setUser] = useState({
    userName: "",
    fullName: "",
    email: "",
    role: "",
  });
  const [loadingSingle, setLoadingSingle] = useState(false); // Loading state for single user creation
  const [loadingBulk, setLoadingBulk] = useState(false); // Loading state for bulk user creation
  const [open, setOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [bulkUsers, setBulkUsers] = useState([]); // State to store bulk users data
  const navigate = useNavigate();
  const { dispatch } = useContext(UserContext);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prevUser) => ({
      ...prevUser,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoadingSingle(true); // Start loading for single user creation
    try {
      await createUser(user, dispatch);
      setDialogMessage("User registered successfully!");
    } catch (err) {
      // Set the error message returned from the backend
      setDialogMessage(err.response?.data?.error || "Failed to register user. Please try again.");
    } finally {
      setOpen(true);
      setLoadingSingle(false); // Stop loading for single user creation
    }
  };

  const handleClose = () => {
    setOpen(false);
    navigate('/users');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const binaryStr = event.target.result;
        const workbook = XLSX.read(binaryStr, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

        // Store the parsed sheet data into state
        setBulkUsers(sheet);
      };
      reader.readAsBinaryString(file);
    }
  };

  const handleBulkCreate = async () => {
    setLoadingBulk(true); // Start loading for bulk user creation
    let errorOccurred = false;
    for (const row of bulkUsers) {
      const newUser = {
        userName: row['Username'],
        fullName: row['Full Name'],
        email: row['Email'],
        role: row['Role'],
      };
      try {
        await createUser(newUser, dispatch);
      } catch (err) {
        errorOccurred = true;
        console.error("Failed to create user:", newUser, err);
      }
    }
    setLoadingBulk(false); // Stop loading for bulk user creation
    setDialogMessage(errorOccurred ? "Some users failed to be created. Check the console for more details." : "Bulk user creation process completed!");
    setOpen(true);
  };

  return (
    <div className="newUser">
      <h1 className="newUserTitle">New User</h1>
      <form className="newUserForm" onSubmit={handleSubmit}>
        {/* User Creation Form Fields */}
        <div className="newUserItem">
          <TextField
            className="newUserItem"
            id="outlined-basic"
            size="small"
            label="Username"
            name="userName"
            variant="outlined"
            value={user.userName}
            onChange={handleChange}
          />
        </div>
        <div className="newUserItem">
          <TextField
            className="newUserItem"
            id="outlined-basic"
            size="small"
            label="Full Name"
            name="fullName"
            variant="outlined"
            value={user.fullName}
            onChange={handleChange}
          />
        </div>
        <div className="newUserItem">
          <TextField
            className="newUserItem"
            id="outlined-basic"
            size="small"
            type="email"
            label="Email"
            name="email"
            variant="outlined"
            value={user.email}
            onChange={handleChange}
          />
        </div>
        <div className="newUserItem">
          <FormControl fullWidth>
            <InputLabel size="small" className="selectlabel" id="role-select-label">Role</InputLabel>
            <Select
              className="newUserSelect"
              labelId="role-select-label"
              id="role-select"
              name="role"
              value={user.role}
              label="Role"
              onChange={handleChange}
            >
              <MenuItem value="student">Student</MenuItem>
              <MenuItem value="canteena">Canteen A (Kalderama)</MenuItem>
              <MenuItem value="canteenb">Canteen B (Hilton)</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </Select>
          </FormControl>
        </div>
      
        <div className="newUserActions">
          <button className="newUserButton" type="submit" disabled={loadingSingle || loadingBulk}>
            {loadingSingle ? <CircularProgress size={24} /> : "Create"}
          </button>

          <div className="fileUpload">
            <div className="fileLable">
              <label>Bulk Creation (.xlsx & .xls only)</label>
              <input
                className="uploadExcel"
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileUpload}
              />
            </div>
            
            <button 
              className="newUserButton" 
              type="button" 
              onClick={handleBulkCreate} 
              disabled={loadingBulk || bulkUsers.length === 0}
            >
              {loadingBulk ? <CircularProgress size={24} /> : "Bulk Create Users"}
            </button>
          </div>
        </div>
      </form>

      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"User Registration"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {dialogMessage}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary" autoFocus>
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
