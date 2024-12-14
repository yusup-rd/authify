import React from "react";
import Link from "next/link";

const Navbar = () => {
    return (
        <nav className="fixed top-0 left-0 right-0 bg-slate-800 text-white p-4 shadow-md z-10">
            <div className="max-w-6xl mx-auto flex justify-between items-center">
                <div className="font-bold text-xl">User Management App</div>
                <div className="flex space-x-4">
                    <Link
                        href="/login"
                        className="text-white py-2 px-4 rounded-md hover:bg-purple-600 transition duration-200"
                    >
                        Login
                    </Link>
                    <Link
                        href="/register"
                        className="text-white py-2 px-4 rounded-md hover:bg-purple-600 transition duration-200"
                    >
                        Register
                    </Link>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
