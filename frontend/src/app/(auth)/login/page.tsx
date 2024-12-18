"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "../../utils/api";
import { Field, Form, Formik } from "formik";
import * as Yup from "yup";
import Link from "next/link";
import axios from "axios";
import { toast } from "react-toastify";

const LoginPage = () => {
    const router = useRouter();
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
        try {
            const response = await login(values.email, values.password);
            toast.success(response.message || "Login successful!");
            router.push("/");
        } catch (error) {
            if (axios.isAxiosError(error)) {
                toast.error(error.response?.data?.message || "Login failed");
            } else {
                toast.error("An error occurred. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center text">
            <div className="bg-slate-800 p-8 rounded-lg shadow-lg max-w-lg w-full">
                <h1 className="text-2xl font-bold text-center mb-4">Login</h1>

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
                <Link
                    href="/register"
                    className="block text-center text-purple-200 font-semibold mt-2 hover:text-purple-400 transition duration-200"
                >
                    Don&apos;t have an account yet? Register
                </Link>
            </div>
        </div>
    );
};

export default LoginPage;
