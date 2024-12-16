import { cookies } from "next/headers";

export default async function HomePage() {
    const cookieStore = cookies();
    const accessToken = (await cookieStore).get("accessToken")?.value || null;

    const isAuthenticated = !!accessToken;

    return (
        <div className="flex justify-center items-center h-screen">
            {isAuthenticated
                ? "User is logged in"
                : "Please log in to access this page."}
        </div>
    );
}
