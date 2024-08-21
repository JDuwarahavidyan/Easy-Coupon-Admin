import "./userList.css";
import { DataGrid } from '@mui/x-data-grid';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { Link } from "react-router-dom";
import { useState, useContext, useEffect } from "react";
import Avatar from '@mui/material/Avatar';
import { UserContext } from '../../context/userContext/UserContext';
import { deleteUser, getUsers, enableUser, disableUser } from "../../context/userContext/apiCalls";
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

export default function UserList() {
  const { users, dispatch } = useContext(UserContext);
  const [open, setOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [roleFilter, setRoleFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => { 
    fetchUsers();  // eslint-disable-next-line
  }, [dispatch]); 

  const fetchUsers = async () => { 
    setLoading(true);
    await getUsers(dispatch);
    setLoading(false);
  };

  const handleClickOpen = (id) => {
    setSelectedUserId(id);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedUserId(null);
  };

  const handleDelete = async () => {
    await deleteUser(selectedUserId, dispatch);
    handleClose();
    fetchUsers(); // Re-fetch users after deletion
  };

  const handleTabChange = (event, newValue) => {
    setRoleFilter(newValue);
  };

  const handleEnable = async (id) => {
    setLoading(true);
    await enableUser(id, dispatch);
    // Update the user in the local state
    updateUserStatus(id, false);
    setLoading(false);
  };

  const handleDisable = async (id) => {
    setLoading(true);
    await disableUser(id, dispatch);
    // Update the user in the local state
    updateUserStatus(id, true);
    setLoading(false);
  };

  const updateUserStatus = (id, disabled) => {
    // Find the user by id and update their status in the local state
    const updatedUsers = users.map(user =>
      user.id === id ? { ...user, disabled } : user
    );
    dispatch({ type: "GET_USERS_SUCCESS", payload: updatedUsers });
  };

  const getColumns = () => {
    const baseColumns = [
      { field: "id", headerName: "ID", width: 300 },
      { 
        field: "userName", 
        headerName: "User Name", 
        width: 200, 
        renderCell: (params) => (
          <div className="userListUser">
            <Avatar className="userListImg" src={params.row.avatar || "https://www.pngkey.com/png/full/114-1149878_setting-user-avatar-in-specific-size-without-breaking.png"} alt=""/>
            {params.row.userName}
          </div>
        )
      },
      { field: "fullName", headerName: "Full Name", width: 200 }, // New fullName column
      { field: "email", headerName: "Email", width: 230 },
      { 
        field: "role", 
        headerName: "Role", 
        width: 150 
      }, // Role column before status
      { 
        field: "status", 
        headerName: "Status", 
        width: 150, 
        renderCell: (params) => (
          <div>
            {params.row.disabled ? (
              <Button 
                variant="contained" 
                color="secondary" 
                onClick={() => handleEnable(params.row.id)}
              >
                Enable
              </Button>
            ) : (
              <Button 
                variant="contained" 
                color="primary" 
                onClick={() => handleDisable(params.row.id)}
              >
                Disable
              </Button>
            )}
          </div>
        )
      },
    ];

    if (roleFilter === 'student') {
      baseColumns.push({ field: "studentCount", headerName: "Count", width: 150 });
    } else if (roleFilter === 'canteen') {
      baseColumns.push({ field: "canteenCount", headerName: "Count", width: 115 });
    }

    // Add the action column
    baseColumns.push({
      field: "action",
      headerName: "Action",
      width: 150,
      renderCell: (params) => (
        <>
          <Link to={"/user/" + params.row.id}>
            <button className="userListEdit">Edit</button>
          </Link>
          <DeleteOutlineIcon className="userListDelete" onClick={() => handleClickOpen(params.row.id)} />
        </>
      )
    });

    return baseColumns;
  };

  const columns = getColumns();

  const filteredUsers = roleFilter === 'all'
    ? users
    : roleFilter === 'canteen'
      ? users.filter(user => user.role === 'canteena' || user.role === 'canteenb')
      : users.filter(user => user.role === roleFilter);

  return (
    <div className="userList">
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Tabs value={roleFilter} onChange={handleTabChange} aria-label="user role filter">
          <Tab label="All" value="all" />
          <Tab label="Student" value="student" />
          <Tab label="Canteen" value="canteen" />
          <Tab label="Admin" value="admin" />
        </Tabs>
        <Link to="/newUser">
            <button className="userAddButton">Create</button>
        </Link>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="100%">
          <CircularProgress />
        </Box>
      ) : (
        <DataGrid
          rows={filteredUsers}
          disableSelectionOnClick
          columns={columns}
          pageSize={10}
          checkboxSelection
          getRowId={(r) => r.id}
        />
      )}
      
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Confirm Deletion"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this user?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDelete} color="primary" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
