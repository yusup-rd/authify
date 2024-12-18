import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginPage from "@/app/(auth)/login/page";
import "@testing-library/jest-dom";
import { useRouter } from "next/navigation";
import { login } from "../../../src/app/utils/api";
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
    login: jest.fn(),
}));

describe("LoginPage - Form Validation", () => {
    beforeEach(() => {
        const mockPush = jest.fn();
        (useRouter as jest.Mock).mockReturnValue({
            push: mockPush,
        });
    });

    it("displays errors for empty form fields", async () => {
        render(<LoginPage />);

        const loginButton = screen.getByRole("button", {
            name: /login/i,
        });

        await userEvent.click(loginButton);

        const emailError = await screen.findByText(/email is required/i);
        const passwordError = await screen.findByText(/password is required/i);

        expect(emailError).toBeInTheDocument();
        expect(passwordError).toBeInTheDocument();
    });

    it("displays error for invalid email", async () => {
        render(<LoginPage />);

        const emailField = screen.getByPlaceholderText(/^Email$/i);
        const loginButton = screen.getByRole("button", {
            name: /login/i,
        });

        await userEvent.type(emailField, "invalidemail");
        await userEvent.click(loginButton);

        expect(
            await screen.findByText(/invalid email address/i)
        ).toBeInTheDocument();
    });

    it("displays error for short password", async () => {
        render(<LoginPage />);

        const passwordField = screen.getByPlaceholderText(/^Password$/i);
        const loginButton = screen.getByRole("button", {
            name: /login/i,
        });

        await userEvent.type(passwordField, "123");
        await userEvent.click(loginButton);

        expect(
            await screen.findByText(/password must be at least 8 characters/i)
        ).toBeInTheDocument();
    });
});

describe("LoginPage - Form API Interaction", () => {
    beforeEach(() => {
        const mockPush = jest.fn();
        (useRouter as jest.Mock).mockReturnValue({
            push: mockPush,
        });
        jest.clearAllMocks();
    });

    it("displays success message on successful form submission", async () => {
        const mockSuccess = {
            message: "Login successful!",
        };
        (login as jest.Mock).mockResolvedValueOnce(mockSuccess);

        render(<LoginPage />);

        await userEvent.type(
            screen.getByPlaceholderText(/Email/i),
            "test@example.com"
        );
        await userEvent.type(
            screen.getByPlaceholderText(/Password/i),
            "password123"
        );

        await userEvent.click(screen.getByRole("button", { name: /login/i }));

        await waitFor(() =>
            expect(toast.success).toHaveBeenCalledWith(mockSuccess.message)
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
        (login as jest.Mock).mockRejectedValueOnce(mockError);

        render(<LoginPage />);

        await userEvent.type(
            screen.getByPlaceholderText(/Email/i),
            "test@example.com"
        );
        await userEvent.type(
            screen.getByPlaceholderText(/Password/i),
            "wrongpassword"
        );

        await userEvent.click(screen.getByRole("button", { name: /login/i }));

        await waitFor(() =>
            expect(toast.error).toHaveBeenCalledWith(
                mockError.response.data.message
            )
        );
    });
});
