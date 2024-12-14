// app/login/page.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Field, Form, Formik } from "formik";
import * as Yup from "yup";

const LoginPage = () => {
    const router = useRouter();
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const validationSchema = Yup.object({
        email: Yup.string()
            .email("Invalid email address")
            .required("Email is required"),
        password: Yup.string()
            .min(8, "Password must be at least 8 characters")
            .required("Password is required"),
    });

    const handleLogin = async (values: { email: string; password: string }) => {
        setIsLoading(true);
        setErrorMessage("");
        try {
            const backendUrl =
                process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

            const response = await axios.post(
                `${backendUrl}/auth/login`, // Assuming your backend uses this route for login
                {
                    email: values.email,
                    password: values.password,
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                    withCredentials: true,
                }
            );

            console.log(response.data);
            router.push("/dashboard"); // Redirect to dashboard after successful login
        } catch (error) {
            console.error(error);
            if (axios.isAxiosError(error)) {
                setErrorMessage(
                    error.response?.data?.message || "Login failed"
                );
            } else {
                setErrorMessage("An error occurred. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center text">
            <div className="bg-slate-800 p-8 rounded-lg shadow-lg max-w-lg w-full">
                <h1 className="text-2xl font-bold text-center mb-4">Login</h1>
                {errorMessage && (
                    <p className="text-red-500 text-center">{errorMessage}</p>
                )}

                <Formik
                    initialValues={{
                        email: "",
                        password: "",
                    }}
                    validationSchema={validationSchema}
                    onSubmit={handleLogin}
                >
                    {({ errors, touched }) => (
                        <Form className="space-y-4 text-black">
                            <div>
                                <Field
                                    type="email"
                                    name="email"
                                    className="w-full p-3 border border-gray-300 rounded-md"
                                    placeholder="Email"
                                />
                                {errors.email && touched.email && (
                                    <div className="text-red-500 text-sm mt-2">
                                        {errors.email}
                                    </div>
                                )}
                            </div>

                            <div>
                                <Field
                                    type="password"
                                    name="password"
                                    className="w-full p-3 border border-gray-300 rounded-md"
                                    placeholder="Password"
                                    autoComplete="on"
                                />
                                {errors.password && touched.password && (
                                    <div className="text-red-500 text-sm mt-2">
                                        {errors.password}
                                    </div>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full py-3 font-bold rounded-md ${
                                    isLoading ? "bg-gray-300" : "bg-purple-600"
                                } text-white`}
                            >
                                {isLoading ? "Logging In..." : "Login"}
                            </button>
                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    );
};

export default LoginPage;
