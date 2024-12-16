export default function HomePage() {
    return (
        <div className="flex justify-center items-center h-screen">
            <div className="text-center p-6">
                <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-slate-400 mb-4">
                    <span className="text-2xl md:text-3xl">
                        Welcome to Our{" "}
                        <span className="text-indigo-100">User Management</span>{" "}
                        System!
                    </span>
                </h1>
                <p className="text-lg sm:text-2xl">
                    Seamlessly manage your accounts, update information, and
                    secure your digital experience with ease.
                </p>

                <p className="mt-6 text-xl text-slate-300">
                    A platform designed with your needs in mind — where control,
                    security, and flexibility meet.
                </p>

                <div className="mt-8 text-center space-x-6">
                    <span className="text-xl font-semibold text-white hover:text-indigo-300 transition-all duration-300 transform hover:scale-105 cursor-pointer">
                        Manage Users
                    </span>
                    <span className="text-xl font-semibold text-white hover:text-indigo-300 transition-all duration-300 transform hover:scale-105 cursor-pointer">
                        Secure Your Data
                    </span>
                    <span className="text-xl font-semibold text-white hover:text-indigo-300 transition-all duration-300 transform hover:scale-105 cursor-pointer">
                        Access Control
                    </span>
                </div>
            </div>
        </div>
    );
}
