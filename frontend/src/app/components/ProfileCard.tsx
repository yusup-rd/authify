"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { User } from "@/app/types/user";
import { getProfile, updateProfile, changePassword } from "../utils/api";
import axios from "axios";
import { useFormik } from "formik";
import * as Yup from "yup";
import ProfileCardSkeleton from "./ProfileCardSkeleton";

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

    const profileFormik = useFormik({
        initialValues: {
            username: initialUsername,
            email: initialEmail,
        },
        enableReinitialize: true,
        validationSchema: Yup.object({
            username: Yup.string().required("Username is required"),
            email: Yup.string()
                .email("Invalid email format")
                .required("Email is required"),
        }),
        onSubmit: async (values) => {
            try {
                const response = await updateProfile(
                    token,
                    values.username,
                    values.email
                );
                toast.success(
                    response.message || "Profile updated successfully!"
                );
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
        },
    });

    const passwordFormik = useFormik({
        initialValues: {
            currentPassword: "",
            newPassword: "",
            confirmNewPassword: "",
        },
        validationSchema: Yup.object({
            currentPassword: Yup.string().required(
                "Current password is required"
            ),
            newPassword: Yup.string()
                .min(8, "Password must be at least 8 characters")
                .required("New password is required"),
            confirmNewPassword: Yup.string()
                .oneOf(
                    [Yup.ref("newPassword"), undefined],
                    "Passwords must match"
                )
                .required("Confirm new password is required"),
        }),
        onSubmit: async (values) => {
            try {
                const response = await changePassword(
                    token,
                    values.currentPassword,
                    values.newPassword
                );
                toast.success(
                    response.message || "Password changed successfully!"
                );
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
        },
    });

    const handleCancel = () => {
        profileFormik.resetForm();
        passwordFormik.resetForm();
        setIsEditing(null);
    };

    if (!user) {
        return <ProfileCardSkeleton />;
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

                <div className="text-lg space-y-4 flex flex-col text-center items-center">
                    {isEditing === "password" ? (
                        <form
                            onSubmit={passwordFormik.handleSubmit}
                            className="space-y-4"
                        >
                            <div>
                                <input
                                    type="password"
                                    placeholder="Current Password"
                                    name="currentPassword"
                                    value={
                                        passwordFormik.values.currentPassword
                                    }
                                    onChange={passwordFormik.handleChange}
                                    className="w-full rounded-md p-2 text-black bg-white border border-gray-300"
                                />
                                {passwordFormik.errors.currentPassword && (
                                    <div className="text-red-500 text-sm mt-3">
                                        {passwordFormik.errors.currentPassword}
                                    </div>
                                )}
                            </div>

                            <div>
                                <input
                                    type="password"
                                    placeholder="New Password"
                                    name="newPassword"
                                    value={passwordFormik.values.newPassword}
                                    onChange={passwordFormik.handleChange}
                                    className="w-full rounded-md p-2 text-black bg-white border border-gray-300"
                                />
                                {passwordFormik.errors.newPassword && (
                                    <div className="text-red-500 text-sm mt-3">
                                        {passwordFormik.errors.newPassword}
                                    </div>
                                )}
                            </div>

                            <div>
                                <input
                                    type="password"
                                    placeholder="Confirm New Password"
                                    name="confirmNewPassword"
                                    value={
                                        passwordFormik.values.confirmNewPassword
                                    }
                                    onChange={passwordFormik.handleChange}
                                    className="w-full rounded-md p-2 text-black bg-white border border-gray-300"
                                />
                                {passwordFormik.errors.confirmNewPassword && (
                                    <div className="text-red-500 text-sm mt-3">
                                        {
                                            passwordFormik.errors
                                                .confirmNewPassword
                                        }
                                    </div>
                                )}
                            </div>
                        </form>
                    ) : (
                        <form
                            onSubmit={profileFormik.handleSubmit}
                            className="space-y-4"
                        >
                            <div>
                                <strong className="text-slate-300 block mb-1">
                                    Username
                                </strong>
                                <input
                                    className={`w-full rounded-md p-2 text-black ${
                                        isEditing === "details"
                                            ? "bg-white border border-gray-300"
                                            : "bg-gray-700 text-slate-300"
                                    }`}
                                    name="username"
                                    value={profileFormik.values.username}
                                    onChange={profileFormik.handleChange}
                                    disabled={isEditing !== "details"}
                                />
                                {profileFormik.errors.username && (
                                    <div className="text-red-500 text-sm mt-3">
                                        {profileFormik.errors.username}
                                    </div>
                                )}
                            </div>

                            <div>
                                <strong className="text-slate-300 block mb-1">
                                    Email
                                </strong>
                                <input
                                    className={`w-full rounded-md p-2 text-black ${
                                        isEditing === "details"
                                            ? "bg-white border border-gray-300"
                                            : "bg-gray-700 text-slate-300"
                                    }`}
                                    name="email"
                                    value={profileFormik.values.email}
                                    onChange={profileFormik.handleChange}
                                    disabled={isEditing !== "details"}
                                />
                                {profileFormik.errors.email && (
                                    <div className="text-red-500 text-sm mt-3">
                                        {profileFormik.errors.email}
                                    </div>
                                )}
                            </div>
                        </form>
                    )}

                    <p className="text-base text-slate-500">
                        Member since {formattedDate}
                    </p>
                </div>

                {/* Buttons */}
                <div className="mt-6 space-x-4 flex justify-center">
                    {isEditing ? (
                        <>
                            <button
                                type="submit"
                                className="bg-indigo-600 text-white py-2 px-6 rounded-md hover:bg-indigo-700"
                                onClick={
                                    isEditing === "details"
                                        ? profileFormik.submitForm
                                        : passwordFormik.submitForm
                                }
                            >
                                Save
                            </button>
                            <button
                                className="bg-gray-500 text-white py-2 px-6 rounded-md hover:bg-gray-600"
                                onClick={handleCancel}
                            >
                                Cancel
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                className="bg-indigo-600 text-white py-2 px-6 rounded-md hover:bg-indigo-700"
                                onClick={() => setIsEditing("details")}
                            >
                                Update Profile
                            </button>
                            <button
                                className="bg-purple-600 text-white py-2 px-6 rounded-md hover:bg-purple-700"
                                onClick={() => {
                                    passwordFormik.resetForm();
                                    setIsEditing("password");
                                }}
                            >
                                Change Password
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfileCard;
