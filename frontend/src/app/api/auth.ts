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
