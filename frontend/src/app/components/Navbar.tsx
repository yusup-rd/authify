"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";

const Navbar = () => {
    const router = useRouter();

    const handleLogout = async () => {
        try {
            const backendUrl =
                process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

            await axios.post(
                `${backendUrl}/auth/logout`,
                {},
                { withCredentials: true }
            );
        } catch (error) {
            console.error("Error during logout:", error);
        }

        router.push("/login");
    };

    return (
        <nav className="fixed top-0 left-0 right-0 bg-slate-800 text-white p-4 shadow-md z-10">
            <div className="max-w-6xl mx-auto flex justify-between">
                <div className="font-bold text-xl">User Management App</div>
                <div>
                    <Link href="/profile" className="mr-4">
                        My Profile
                    </Link>
                    <button
                        className="bg-purple-600 text-white px-4 py-2 rounded-md"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
