import "./qrCodeList.css";
import { DataGrid } from '@mui/x-data-grid';
import { useState, useContext, useEffect } from "react";
import { QrCodeContext } from '../../context/qrCodeContext/QrCodeContext';
import { getQrcodes } from "../../context/qrCodeContext/apiCalls";
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';
import SearchIcon from '@mui/icons-material/Search';
import InputAdornment from '@mui/material/InputAdornment';
import { DateRangePicker } from 'rsuite';
import 'rsuite/dist/rsuite.min.css';


export default function QrCodeList() {
  const { qrcodes, dispatch } = useContext(QrCodeContext);
  const [roleFilter, setRoleFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQrCodes(); // Fetch initial data
    const ws = new WebSocket('ws://localhost:8800'); // Replace with your backend WebSocket URL

    ws.onopen = () => {
      console.log('Connected to WebSocket');
    };

    ws.onmessage = (event) => {
      const updatedQrcodes = JSON.parse(event.data);
      dispatch({ type: "GET_QRCODES_SUCCESS", payload: updatedQrcodes });
    };

    ws.onclose = () => {
      console.log('Disconnected from WebSocket');
    };

    return () => {
      ws.close();
    };
  }, [dispatch]);

  const fetchQrCodes = async () => {
    setLoading(true);
    await getQrcodes(dispatch);
    setLoading(false);
  };

  const handleTabChange = (event, newValue) => {
    setRoleFilter(newValue);
  };

  const getColumns = () => {
    const baseColumns = [
      { field: "id", headerName: "ID", width: 300 },
      {
        field: "studentName",
        headerName: "Student User Name",
        width: 200,
        renderCell: (params) => (
          <div className="userListUser">
            {params.row.studentName}
          </div>
        )
      },
      { field: "canteenName", headerName: "Canteen User Name", width: 200 },
      { field: "canteenType", headerName: "Canteen Type", width: 230 },
      {
        field: "count",
        headerName: "Coupons Used",
        width: 150
      },
      {
        field: "scannedAt",
        headerName: "Date and Time",
        width: 200,
        renderCell: (params) => {
          const date = new Date(params.row.scannedAt);
          const formattedDate = date.toLocaleDateString('en-GB');
          const formattedTime = date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
            hour12: true // 12-hour format with AM/PM
          });
          return `${formattedDate}, ${formattedTime}`;
        }
      },
    ];

    return baseColumns;
  };

  const columns = getColumns();

  const filteredQrCodes = qrcodes.filter(qrcodes => {
    const matchesRole = roleFilter === 'all'
      ? true
      : roleFilter === 'canteena'
        ? qrcodes.canteenType === 'canteena'
        : qrcodes.canteenType === roleFilter;

    const matchesSearch =
      (String(qrcodes.studentName).toLowerCase().includes(searchQuery.toLowerCase())) ||
      (qrcodes.id.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (qrcodes.canteenName.toLowerCase() || "").includes(searchQuery.toLowerCase());

    return matchesRole && matchesSearch;
  });

  return (
    <div className="userList">
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Tabs value={roleFilter} onChange={handleTabChange} aria-label="user role filter">
          <Tab label="All" value="all" />
          <Tab label="Canteen A (Kalderama)" value="canteena" />
          <Tab label="Canteen B (Hilton)" value="canteenb" />
        </Tabs>
        <Box display="flex" alignItems="center" marginRight={0}>
        <DateRangePicker />
        </Box>
        <Box display="flex" alignItems="center">
         
          <TextField
            variant="outlined"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="searchInput"
            InputProps={{
              inputProps: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              },
            }}
            style={{ marginRight: '16px', width: '300px' }} // Adjust width and margin as needed
          />
        </Box>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="100%">
          <CircularProgress />
        </Box>
      ) : (
        <DataGrid
          rows={filteredQrCodes}
          disableSelectionOnClick
          columns={columns}
          pageSize={10} // Limit to 10 records per page
          pageSizeOptions={[10, 25, 50, 100]} // Additional page size options
          pagination // Enable pagination
          checkboxSelection
          getRowId={(r) => r.id}
        />
      )}
    </div>
  );
}
