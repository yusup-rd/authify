import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RegisterPage from "@/app/(auth)/register/page";
import "@testing-library/jest-dom";
import { useRouter } from "next/navigation";
import { register } from "../../../src/app/utils/api";
import { toast } from "react-toastify";

jest.mock("next/navigation", () => ({
    useRouter: jest.fn(),
}));

jest.mock("react-toastify", () => ({
    toast: {
        success: jest.fn(),
        error: jest.fn(),
    },
}));

jest.mock("../../../src/app/utils/api", () => ({
    register: jest.fn(),
}));

describe("RegisterPage - Form Validation", () => {
    beforeEach(() => {
        const mockPush = jest.fn();
        (useRouter as jest.Mock).mockReturnValue({
            push: mockPush,
        });
    });

    it("displays errors for empty form fields", async () => {
        render(<RegisterPage />);

        const registerButton = screen.getByRole("button", {
            name: /register/i,
        });
        await userEvent.click(registerButton);

        const usernameError = await screen.findByText(
            /^username is required$/i
        );
        const emailError = await screen.findByText(/^email is required$/i);
        const passwordError = await screen.findByText(
            /^password is required$/i
        );
        const confirmPasswordError = await screen.findByText(
            /^confirm password is required$/i
        );

        expect(usernameError).toBeInTheDocument();
        expect(emailError).toBeInTheDocument();
        expect(passwordError).toBeInTheDocument();
        expect(confirmPasswordError).toBeInTheDocument();
    });

    it("displays error for mismatched passwords", async () => {
        render(<RegisterPage />);

        const passwordField = screen.getByPlaceholderText(/^Password$/i);
        const confirmPasswordField =
            screen.getByPlaceholderText(/^Confirm Password$/i);

        const registerButton = screen.getByRole("button", {
            name: /register/i,
        });

        await userEvent.type(passwordField, "password123");
        await userEvent.type(confirmPasswordField, "differentpassword");

        await userEvent.click(registerButton);

        expect(
            await screen.findByText(/passwords must match/i)
        ).toBeInTheDocument();
    });

    it("displays error for short password", async () => {
        render(<RegisterPage />);

        const passwordField = screen.getByPlaceholderText(/^Password$/i);

        const registerButton = screen.getByRole("button", {
            name: /register/i,
        });

        await userEvent.type(passwordField, "123");

        await userEvent.click(registerButton);

        expect(
            await screen.findByText(/password must be at least 8 characters/i)
        ).toBeInTheDocument();
    });

    it("displays error for invalid email", async () => {
        render(<RegisterPage />);

        const emailField = screen.getByPlaceholderText(/^Email$/i);

        const registerButton = screen.getByRole("button", {
            name: /register/i,
        });

        await userEvent.type(emailField, "invalidemail");

        await userEvent.click(registerButton);

        expect(
            await screen.findByText(/invalid email address/i)
        ).toBeInTheDocument();
    });
});

describe("RegisterPage - Form API Interaction", () => {
    beforeEach(() => {
        const mockPush = jest.fn();
        (useRouter as jest.Mock).mockReturnValue({
            push: mockPush,
        });

        jest.clearAllMocks();
    });

    it("displays success message on successful form submission", async () => {
        const mockSuccess = {
            response: {
                data: {
                    message: "Registration successful!",
                },
            },
        };
        (register as jest.Mock).mockResolvedValueOnce(mockSuccess);

        render(<RegisterPage />);

        await userEvent.type(
            screen.getByPlaceholderText(/Username/i),
            "testuser"
        );
        await userEvent.type(
            screen.getByPlaceholderText(/Email/i),
            "test@example.com"
        );
        await userEvent.type(
            screen.getByPlaceholderText(/^Password$/i),
            "password123"
        );
        await userEvent.type(
            screen.getByPlaceholderText(/Confirm Password/i),
            "password123"
        );

        await userEvent.click(
            screen.getByRole("button", { name: /register/i })
        );

        await waitFor(() =>
            expect(toast.success).toHaveBeenCalledWith(
                mockSuccess.response.data.message
            )
        );
    });

    it("displays error message on invalid form submission", async () => {
        const mockError = {
            response: {
                data: {
                    message: "An error occurred. Please try again.",
                },
            },
        };
        (register as jest.Mock).mockRejectedValueOnce(mockError);

        render(<RegisterPage />);

        await userEvent.type(
            screen.getByPlaceholderText(/Username/i),
            "existinguser"
        );
        await userEvent.type(
            screen.getByPlaceholderText(/Email/i),
            "test@example.com"
        );
        await userEvent.type(
            screen.getByPlaceholderText(/^Password$/i),
            "password123"
        );
        await userEvent.type(
            screen.getByPlaceholderText(/Confirm Password/i),
            "password123"
        );

        await userEvent.click(
            screen.getByRole("button", { name: /register/i })
        );

        await waitFor(() =>
            expect(toast.error).toHaveBeenCalledWith(
                mockError.response.data.message
            )
        );
    });
});
