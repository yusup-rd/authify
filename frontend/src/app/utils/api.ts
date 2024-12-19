import axios from "axios";

const backendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

// Function to register
export const register = async (
    username: string,
    email: string,
    password: string
) => {
    try {
        const response = await axios.post(
            `${backendUrl}/auth/register`,
            { username, email, password },
            {
                headers: {
                    "Content-Type": "application/json",
                },
                withCredentials: true,
            }
        );
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Function to login
export const login = async (email: string, password: string) => {
    try {
        const response = await axios.post(
            `${backendUrl}/auth/login`,
            { email, password },
            {
                headers: {
                    "Content-Type": "application/json",
                },
                withCredentials: true,
            }
        );
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Function to logout
export const logout = async () => {
    try {
        await axios.post(
            `${backendUrl}/auth/logout`,
            {},
            { withCredentials: true }
        );
    } catch (error) {
        throw error;
    }
};

// Function to get the user
export const getProfile = async (token: string) => {
    try {
        const response = await axios.get(`${backendUrl}/users/profile`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Function to update the user
export const updateProfile = async (
    token: string,
    username: string,
    email: string
) => {
    try {
        const response = await axios.put(
            `${backendUrl}/users/profile`,
            { username, email },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Function to change user password
export const changePassword = async (
    token: string,
    currentPassword: string,
    newPassword: string
) => {
    try {
        const response = await axios.put(
            `${backendUrl}/users/change-password`,
            {
                currentPassword,
                newPassword,
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        throw error;
    }
};
