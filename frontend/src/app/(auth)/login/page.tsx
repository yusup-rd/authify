"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { User } from "@/app/types/user";
import { getProfile, updateProfile, changePassword } from "../../utils/api";
import axios from "axios";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";

const ProfileCard = ({ token }: { token: string }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isEditing, setIsEditing] = useState<"details" | "password" | null>(
        null
    );

    const [initialUsername, setInitialUsername] = useState<string>("");
    const [initialEmail, setInitialEmail] = useState<string>("");

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await getProfile(token);
                const user = response.user;
                setUser(user);
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

    const profileValidationSchema = Yup.object({
        username: Yup.string().required("Username is required"),
        email: Yup.string()
            .email("Invalid email format")
            .required("Email is required"),
    });

    const passwordValidationSchema = Yup.object({
        currentPassword: Yup.string().required("Current password is required"),
        newPassword: Yup.string()
            .min(8, "Password must be at least 8 characters")
            .required("New password is required"),
        confirmNewPassword: Yup.string()
            .oneOf([Yup.ref("newPassword"), undefined], "Passwords must match")
            .required("Confirm new password is required"),
    });

    const handleProfileSubmit = async (values: {
        username: string;
        email: string;
    }) => {
        try {
            const response = await updateProfile(
                token,
                values.username,
                values.email
            );
            toast.success(response.message || "Profile updated successfully!");
            setIsEditing(null);
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

    const handlePasswordSubmit = async (values: {
        currentPassword: string;
        newPassword: string;
    }) => {
        try {
            const response = await changePassword(
                token,
                values.currentPassword,
                values.newPassword
            );
            toast.success(response.message || "Password changed successfully!");
            setIsEditing(null);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                toast.error(
                    error.response?.data?.message ||
                        "Failed to change your password."
                );
            } else {
                toast.error("An error occurred. Please try again.");
            }
        }
    };

    const handleCancel = () => {
        setIsEditing(null);
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
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src="https://api.dicebear.com/9.x/pixel-art/svg"
                        alt="Profile"
                        className="object-cover w-full h-full"
                    />
                </div>

                <h1 className="text-3xl font-semibold mb-6 text-center text-gradient">
                    Welcome, {user.username}!
                </h1>

                {/* Profile Form */}
                {isEditing === "details" ? (
                    <Formik
                        initialValues={{
                            username: initialUsername,
                            email: initialEmail,
                        }}
                        enableReinitialize
                        validationSchema={profileValidationSchema}
                        onSubmit={handleProfileSubmit}
                    >
                        <Form className="space-y-4">
                            <div>
                                <Field
                                    type="text"
                                    name="username"
                                    className="w-full rounded-md p-2 text-black bg-white border border-gray-300"
                                    placeholder="Username"
                                />
                            </div>
                            <div>
                                <Field
                                    type="email"
                                    name="email"
                                    className="w-full rounded-md p-2 text-black bg-white border border-gray-300"
                                    placeholder="Email"
                                />
                            </div>
                            <div className="flex justify-center space-x-4 mt-4">
                                <button
                                    type="submit"
                                    className="bg-indigo-600 text-white py-2 px-6 rounded-md hover:bg-indigo-700"
                                >
                                    Save
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="bg-gray-500 text-white py-2 px-6 rounded-md hover:bg-gray-600"
                                >
                                    Cancel
                                </button>
                            </div>
                        </Form>
                    </Formik>
                ) : isEditing === "password" ? (
                    <Formik
                        initialValues={{
                            currentPassword: "",
                            newPassword: "",
                            confirmNewPassword: "",
                        }}
                        validationSchema={passwordValidationSchema}
                        onSubmit={handlePasswordSubmit}
                    >
                        <Form className="space-y-4">
                            <div>
                                <Field
                                    type="password"
                                    name="currentPassword"
                                    className="w-full rounded-md p-2 text-black bg-white border border-gray-300"
                                    placeholder="Current Password"
                                />
                            </div>
                            <div>
                                <Field
                                    type="password"
                                    name="newPassword"
                                    className="w-full rounded-md p-2 text-black bg-white border border-gray-300"
                                    placeholder="New Password"
                                />
                            </div>
                            <div>
                                <Field
                                    type="password"
                                    name="confirmNewPassword"
                                    className="w-full rounded-md p-2 text-black bg-white border border-gray-300"
                                    placeholder="Confirm New Password"
                                />
                            </div>
                            <div className="flex justify-center space-x-4 mt-4">
                                <button
                                    type="submit"
                                    className="bg-indigo-600 text-white py-2 px-6 rounded-md hover:bg-indigo-700"
                                >
                                    Save
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="bg-gray-500 text-white py-2 px-6 rounded-md hover:bg-gray-600"
                                >
                                    Cancel
                                </button>
                            </div>
                        </Form>
                    </Formik>
                ) : (
                    <div className="text-lg space-y-4 text-center">
                        <p className="text-base text-slate-500">
                            Member since {formattedDate}
                        </p>
                        <div className="flex justify-center space-x-4 mt-6">
                            <button
                                onClick={() => setIsEditing("details")}
                                className="bg-indigo-600 text-white py-2 px-6 rounded-md hover:bg-indigo-700"
                            >
                                Update Profile
                            </button>
                            <button
                                onClick={() => setIsEditing("password")}
                                className="bg-purple-600 text-white py-2 px-6 rounded-md hover:bg-purple-700"
                            >
                                Change Password
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfileCard;
