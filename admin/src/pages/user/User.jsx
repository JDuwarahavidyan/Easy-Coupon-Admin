import './user.css'
import { Stack } from '@mui/material'
import { Avatar } from '@mui/material'
import PermIdentityIcon from '@mui/icons-material/PermIdentity';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import TextField from '@mui/material/TextField';
import PublishIcon from '@mui/icons-material/Publish';
import { Link } from 'react-router-dom';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import { useState, useContext, useEffect } from "react";
import { UserContext } from '../../context/userContext/UserContext';
import { updateUser, getUsers } from "../../context/userContext/apiCalls";
import { useLocation } from "react-router-dom";
import { useNavigate } from 'react-router-dom';

export default function User() {
  const location = useLocation();
  const navigate = useNavigate();
  const { dispatch } = useContext(UserContext);
  const [loading, setLoading] = useState(true);
  const initialUser = location.state.users;
  const [user, setUser] = useState(initialUser);
  
  useEffect(() => {
    console.log("location", location);
  }, [location]);

  return (
    <div className='user'>
      <div className="userTitleContainer">
        <h1 className="userTitle">Edit User</h1>
        <Link to="/newUser">
          <Button className="createButton" variant="contained" color="primary">
            Create
          </Button>
        </Link>
      </div>
      <div className="userContainer">
        <div className="userShow">
          <div className="userShowTop">
            <Stack direction="row" spacing={2}>
              <Avatar
                src={user.profilePic}
                alt=""
                className="userShowImg"
              />
            </Stack>
            <div className="userShowTopTitle">
              <span className='userShowUsername'>{user.userName}</span>
              <span className='userShowUserTitle'>{user.role}</span>
            </div>
          </div>

          <div className="userShowBottom">
            <span className="userShowTitle">Account Details</span>
            <div className="userShowInfo">
              <PermIdentityIcon className="userShowIcon" />
              <span className="userShowInfoTitle">ID: {user.id}</span>
            </div>

            <div className="userShowInfo">
              <PermIdentityIcon className="userShowIcon" />
              <span className="userShowInfoTitle">Full Name: {user.fullName}</span>
            </div>

            <span className="userShowTitle">Other Details</span>
            <div className="userShowInfo">
              <MailOutlineIcon className="userShowIcon" />
              <span className="userShowInfoTitle">Email: {user.email}</span>
            </div>
            
            {user.role === "student" && (
              <div className="userShowInfo">
                <LocationOnIcon className="userShowIcon" />
                <span className="userShowInfoTitle">
                  Remaining {user.studentCount === 1 ? "Coupon: " : "Coupons: "}{user.studentCount}
                </span>
              </div>
            )}

            {(user.role === "canteena" || user.role === "canteenb") && (
              <div className="userShowInfo">
                <LocationOnIcon className="userShowIcon" />
                <span className="userShowInfoTitle">
                  Current Usage: {user.canteenCount}
                </span>
              </div>
            )}

            {user.role === "admin" && (
              <div className="userShowInfo">
                <CalendarTodayIcon className="userShowIcon" />
                <span className="userShowInfoTitle">
                  Created At: {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </div>
            )}


          </div>
        </div>

        <div className="userUpdate">
          <span className="userUpdateTitle">Edit</span>
          <form className="userUpdateForm">
            <div className="userUpdateLeft">
              <div className="userUpdateItem">
                <TextField className="userUpdateInput" id="outlined-basic" label="Username" variant="outlined" />
              </div>

              <div className="userUpdateItem">
                <TextField className="userUpdateInput" id="outlined-basic" label="Full Name" variant="outlined" />
              </div>

              <div className="userUpdateItem">
                <TextField className="userUpdateInput" id="outlined-basic" type='email' label="Email" variant="outlined" />
              </div>
              <div className="userUpdateItem">
                <FormControl fullWidth>
                  <InputLabel size="small" className="selectlabel" id="role-select-label">Role</InputLabel>
                  <Select
                    className="newUserSelect"
                    labelId="role-select-label"
                    id="role-select"
                    name="role"
                    label="Role"
                  >
                    <MenuItem value="student">Student</MenuItem>
                    <MenuItem value="canteena">Canteen A (Kalderama)</MenuItem>
                    <MenuItem value="canteenb">Canteen B (Hilton)</MenuItem>
                    <MenuItem value="admin">Admin</MenuItem>
                  </Select>
                </FormControl>
              </div>
              
            </div>
            <div className="userUpdateRight">
              <div className="userUpdateUpload">
                <Stack direction="row" spacing={2}>
                  <Avatar
                    src="https://img.freepik.com/free-photo/portrait-happy-young-man-white-suit-eyeglasses_1142-51365.jpg?t=st=1712994115~exp=1712997715~hmac=e3b20fc36b6f10fa4f5392c7f05a53aef7f72eb7f43012b4ce3619a6ed8da133&w=740"
                    alt=""
                    className="userUpdateImg"
                  />
                </Stack>
                <label htmlFor="file">
                  <PublishIcon className="userUpdateIcon" />
                </label>
                <input type="file" id="file" style={{ display: "none" }} />
              </div>
              <Button className="createButton" variant="contained" color="primary">
                Update
              </Button>
            </div>
          </form>
        </div>
      </div>

      {(user.role === "canteena" || user.role === "canteenb") && (
        <div className="userShow">
          <Button className="createButton" variant="contained" color="primary">
            Generate QR Code
          </Button>
        </div>
      )}
    </div>
  );
}
