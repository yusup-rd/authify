"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { register } from "../../utils/api";
import { Field, Form, Formik } from "formik";
import * as Yup from "yup";
import Link from "next/link";
import axios from "axios";
import { toast } from "react-toastify";

const RegisterPage = () => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const validationSchema = Yup.object({
        username: Yup.string().required("Username is required"),
        email: Yup.string()
            .email("Invalid email address")
            .required("Email is required"),
        password: Yup.string()
            .min(8, "Password must be at least 8 characters")
            .required("Password is required"),
        confirmPassword: Yup.string()
            .oneOf([Yup.ref("password"), undefined], "Passwords must match")
            .required("Confirm password is required"),
    });

    const handleRegister = async (values: {
        username: string;
        email: string;
        password: string;
        confirmPassword: string;
    }) => {
        setIsLoading(true);
        try {
            const response = await register(
                values.username,
                values.email,
                values.password
            );
            toast.success(response.message || "Registration successful!");
            router.push("/login");
        } catch (error) {
            console.error(error);
            if (axios.isAxiosError(error)) {
                toast.error(
                    error.response?.data?.message || "Registration failed"
                );
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
                <h1 className="text-2xl font-bold text-center mb-4">
                    Register
                </h1>

                <Formik
                    initialValues={{
                        username: "",
                        email: "",
                        password: "",
                        confirmPassword: "",
                    }}
                    validationSchema={validationSchema}
                    onSubmit={handleRegister}
                >
                    {({ errors, touched }) => (
                        <Form className="space-y-4 text-black">
                            <div>
                                <Field
                                    type="text"
                                    name="username"
                                    className="w-full p-3 border border-gray-300 rounded-md"
                                    placeholder="Username"
                                />
                                {errors.username && touched.username && (
                                    <div className="text-red-500 text-sm mt-2">
                                        {errors.username}
                                    </div>
                                )}
                            </div>

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

                            <div>
                                <Field
                                    type="password"
                                    name="confirmPassword"
                                    className="w-full p-3 border border-gray-300 rounded-md"
                                    placeholder="Confirm Password"
                                    autoComplete="on"
                                />
                                {errors.confirmPassword &&
                                    touched.confirmPassword && (
                                        <div className="text-red-500 text-sm mt-2">
                                            {errors.confirmPassword}
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
                                {isLoading ? "Registering..." : "Register"}
                            </button>
                        </Form>
                    )}
                </Formik>
                <Link
                    href="/login"
                    className="block text-center text-purple-200 font-semibold mt-2 hover:text-purple-400 transition duration-200"
                >
                    Already have an account? Login
                </Link>
            </div>
        </div>
    );
};

export default RegisterPage;
