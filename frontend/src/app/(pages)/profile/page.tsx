import axios from "axios";
import { cookies } from "next/headers";
import { JSX } from "react";

const ProfilePage = async (): Promise<JSX.Element> => {
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken");

    if (!token) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p className="text-red-500">
                    You need to log in to view your profile.
                </p>
            </div>
        );
    }

    try {
        const backendUrl =
            process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
        const response = await axios.get(`${backendUrl}/users/profile`, {
            headers: {
                Authorization: `Bearer ${token.value}`,
            },
        });

        const user = response.data.user;

        const formattedDate = new Date(user.created_at).toLocaleDateString(
            "en-GB",
            {
                day: "numeric",
                month: "long",
                year: "numeric",
            }
        );

        return (
            <div className="flex flex-col lg:flex-row justify-center items-center h-screen p-4">
                <div className="lg:w-1/2 w-full p-4">
                    <p className="hidden lg:block text-4xl lg:text-6xl font-semibold text-slate-700 text-center lg:text-left">
                        A good user management system doesn&apos;t just store
                        information — it empowers people to manage their digital
                        lives securely and seamlessly.
                    </p>
                </div>

                <div className="lg:w-1/2 w-full p-4 flex flex-col items-center lg:items-end">
                    <div className="bg-slate-800 text-white p-8 rounded-xl shadow-xl w-full max-w-md">
                        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-indigo-600 mx-auto mb-6">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src="https://api.dicebear.com/9.x/pixel-art/svg"
                                alt="Profile"
                                className="object-cover w-full h-full"
                            />
                        </div>

                        <h1 className="text-3xl font-semibold mb-6 text-center lg:text-left text-gradient">
                            Welcome, {user.username}!
                        </h1>

                        <div className="text-lg space-y-4 text-center flex flex-col items-center lg:items-start">
                            <p className="flex items-center">
                                <strong className="mr-2 text-xl text-slate-300">
                                    Username:
                                </strong>
                                <span>{user.username}</span>
                            </p>
                            <p className="flex items-center">
                                <strong className="mr-2 text-xl text-slate-300">
                                    Email:
                                </strong>
                                <span>{user.email}</span>
                            </p>
                            <p className="flex items-center">
                                <span className="mr-2 text-base text-slate-500">
                                    Since {formattedDate}
                                </span>
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-6 space-x-4 flex justify-center lg:justify-start">
                            <button className="bg-indigo-600 text-white py-2 px-6 rounded-md hover:bg-indigo-700 focus:outline-none transition-all duration-200 transform hover:scale-105">
                                Edit Info
                            </button>
                            <button className="bg-purple-600 text-white py-2 px-6 rounded-md hover:bg-purple-700 focus:outline-none transition-all duration-200 transform hover:scale-105">
                                Change Password
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    } catch (error) {
        console.error("Error fetching profile data:", error);
        return (
            <div className="flex justify-center items-center h-screen">
                <p className="text-red-500">
                    Failed to fetch your profile. Please try again later.
                </p>
            </div>
        );
    }
};

export default ProfilePage;
