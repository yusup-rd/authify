"use client";

import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import axios from "axios";

const Navbar = () => {
    const router = useRouter();

    const currentPath = usePathname();

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
                <Link href="/" className="font-bold text-xl mt-1">
                    Authify
                </Link>
                <div>
                    <Link
                        href="/"
                        className={`inline-block mr-1 font-semibold text-white px-4 py-2 rounded-md transition ${
                            currentPath === "/"
                                ? "bg-indigo-600"
                                : "hover:bg-gray-700"
                        }`}
                    >
                        Home
                    </Link>
                    <Link
                        href="/profile"
                        className={`inline-block mr-4 font-semibold text-white px-4 py-2 rounded-md transition ${
                            currentPath === "/profile"
                                ? "bg-indigo-600"
                                : "hover:bg-gray-700"
                        }`}
                    >
                        My Profile
                    </Link>
                    <button
                        className="bg-purple-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-purple-700 transition "
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
