import axios from "axios";
import { loginFailure, loginStart, loginSuccess } from "./AuthActions";

export const login = async (user, dispatch) => {
    dispatch(loginStart());
    try {
        const res = await axios.post("/auth/login", user); // Send username and password
        if (res.data.customToken) {
            dispatch(loginSuccess(res.data)); // Store the customToken and user data
            return null; // No error
        } else {
            dispatch(loginFailure());
            return "Not an admin";
        }
    } catch (err) {
        dispatch(loginFailure());
        return "Invalid username or password"; // Return error message
    }
}
