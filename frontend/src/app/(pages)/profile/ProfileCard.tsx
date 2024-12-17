"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { User } from "@/app/types/user";
import { getProfile, updateProfile } from "../../utils/api";
import axios from "axios";

const ProfileCard = ({ token }: { token: string }) => {
    const [user, setUser] = useState<User | null>(null);
    const [username, setUsername] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [isEditing, setIsEditing] = useState<boolean>(false);

    const [initialUsername, setInitialUsername] = useState<string>("");
    const [initialEmail, setInitialEmail] = useState<string>("");

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await getProfile(token);
                const user = response.user;
                setUser(user);
                setUsername(user.username);
                setEmail(user.email);
                setInitialUsername(user.username);
                setInitialEmail(user.email);
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    toast.error(
                        error.response?.data?.message ||
                            "Failed to fetch user data."
                    );
                } else {
                    toast.error("An error occurred. Please try again.");
                }
            }
        };
        fetchUserData();
    }, [token]);

    const handleSave = async () => {
        try {
            const response = await updateProfile(token, username, email);
            toast.success(response.message || "Profile updated successfully!");
            setIsEditing(false);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                toast.error(
                    error.response?.data?.message ||
                        "Failed to update your profile."
                );
            } else {
                toast.error("An error occurred. Please try again.");
            }
        }
    };

    const handleCancel = () => {
        setUsername(initialUsername);
        setEmail(initialEmail);
        setIsEditing(false);
    };

    if (!user) {
        return <div>Loading...</div>;
    }

    const formattedDate = new Date(user.created_at).toLocaleDateString(
        "en-GB",
        {
            day: "numeric",
            month: "long",
            year: "numeric",
        }
    );

    return (
        <div className="lg:w-1/2 w-full p-4 flex flex-col items-center lg:items-end">
            <div className="bg-slate-800 text-white p-8 rounded-xl shadow-xl w-full max-w-md">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-indigo-600 mx-auto mb-6">
                    {/*  eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src="https://api.dicebear.com/9.x/pixel-art/svg"
                        alt="Profile"
                        className="object-cover w-full h-full"
                    />
                </div>

                <h1 className="text-3xl font-semibold mb-6 text-center text-gradient">
                    Welcome, {user.username}!
                </h1>

                <div className="text-lg space-y-4 flex flex-col text-center items-center">
                    <div>
                        <strong className="text-slate-300 block mb-1">
                            Username
                        </strong>
                        <input
                            className={`w-full rounded-md p-2 text-black ${
                                isEditing
                                    ? "bg-white border border-gray-300"
                                    : "bg-gray-700 text-slate-300"
                            }`}
                            value={username}
                            disabled={!isEditing}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>

                    <div>
                        <strong className="text-slate-300 block mb-1">
                            Email
                        </strong>
                        <input
                            className={`w-full rounded-md p-2 text-black ${
                                isEditing
                                    ? "bg-white border border-gray-300"
                                    : "bg-gray-700 text-slate-300"
                            }`}
                            value={email}
                            disabled={!isEditing}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <p className="text-base text-slate-500">
                        Member since {formattedDate}
                    </p>
                </div>

                <div className="mt-6 space-x-4 flex justify-center">
                    {isEditing ? (
                        <>
                            <button
                                className="bg-indigo-600 text-white py-2 px-6 rounded-md hover:bg-indigo-700 focus:outline-none transition-transform transform hover:scale-105"
                                onClick={handleSave}
                            >
                                Save
                            </button>
                            <button
                                className="bg-gray-500 text-white py-2 px-6 rounded-md hover:bg-gray-600 focus:outline-none transition-transform transform hover:scale-105"
                                onClick={handleCancel}
                            >
                                Cancel
                            </button>
                        </>
                    ) : (
                        <button
                            className="bg-indigo-600 text-white py-2 px-6 rounded-md hover:bg-indigo-700 focus:outline-none transition-transform transform hover:scale-105"
                            onClick={() => setIsEditing(true)}
                        >
                            Edit Info
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfileCard;
