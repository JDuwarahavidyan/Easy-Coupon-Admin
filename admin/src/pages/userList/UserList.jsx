import "./userList.css";
import { DataGrid } from "@material-ui/data-grid";
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { Link } from "react-router-dom";
import { useState, useContext, useEffect } from "react";
import Avatar from '@mui/material/Avatar';
import { UserContext } from '../../context/userContext/UserContext';
import { deleteUser, getUsers } from "../../context/userContext/apiCalls";
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
    getUsers(dispatch).finally(() => setLoading(false));
  }, [dispatch]);

  const handleClickOpen = (id) => {
    setSelectedUserId(id);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedUserId(null);
  };

  const handleDelete = () => {
    deleteUser(selectedUserId, dispatch);
    handleClose();
    window.location.reload();
  };

  const handleTabChange = (event, newValue) => {
    setRoleFilter(newValue);
  };

  
  const getColumns = () => {
    switch(roleFilter) {
      case 'student':
        return [
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
          { field: "email", headerName: "Email", width: 300 },
          { field: "studentCount", headerName: "Count", width: 150 },
          {
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
          },
        ];
      case 'canteen':
        return [
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
          { field: "email", headerName: "Email", width: 300 },
          { field: "role", headerName: "Role", width: 110 },
          { field: "canteenCount", headerName: "Count", width: 115 },
          {
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
          },
        ];
      case 'admin':
      case 'all':
      default:
        return [
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
          { field: "email", headerName: "Email", width: 300 },
          { field: "role", headerName: "Role", width: 150 },
          {
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
          },
        ];
    }
  }

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
        <Button variant="contained" color="primary" onClick={() => {/* handle create user */}}>
          Create New User
        </Button>
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
