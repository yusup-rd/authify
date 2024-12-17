import { cookies } from "next/headers";
import { JSX } from "react";
import ProfileCard from "./ProfileCard";

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

    return (
        <div className="flex flex-col lg:flex-row justify-center items-center h-screen p-4">
            <div className="lg:w-1/2 w-full p-4">
                <p className="hidden lg:block text-4xl lg:text-6xl font-semibold text-slate-700 text-center lg:text-left">
                    A good user management system doesn&apos;t just store
                    information — it empowers people to manage their digital
                    lives securely and seamlessly.
                </p>
            </div>
            <ProfileCard token={token.value} />
        </div>
    );
};

export default ProfilePage;
