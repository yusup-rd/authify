const ProfileCardSkeleton = () => {
    return (
        <div className="lg:w-1/2 w-full p-4 flex flex-col items-center lg:items-end">
            <div className="bg-slate-800 p-8 rounded-xl shadow-xl w-full max-w-md animate-pulse">
                <div className="w-24 h-24 rounded-full bg-gray-700 mx-auto mb-6"></div>

                <div className="h-8 w-3/4 bg-gray-700 mx-auto mb-6 rounded-md"></div>

                <div className="space-y-4">
                    <div className="h-6 bg-gray-700 rounded-md"></div>
                    <div className="h-6 bg-gray-700 rounded-md"></div>
                    <div className="h-6 bg-gray-700 rounded-md"></div>
                </div>

                <div className="mt-6 flex space-x-4 justify-center">
                    <div className="h-10 w-1/4 bg-gray-700 rounded-md"></div>
                    <div className="h-10 w-1/4 bg-gray-700 rounded-md"></div>
                </div>
            </div>
        </div>
    );
};

export default ProfileCardSkeleton;
