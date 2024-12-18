import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import ProfileCard from "@/app/components/ProfileCard";
import {
    changePassword,
    getProfile,
    updateProfile,
} from "../../src/app/utils/api";
import userEvent from "@testing-library/user-event";
import { toast } from "react-toastify";

jest.mock("../../src/app/utils/api", () => ({
    getProfile: jest.fn(),
    updateProfile: jest.fn(),
    changePassword: jest.fn(),
}));

jest.mock("react-toastify", () => ({
    toast: {
        success: jest.fn(),
        error: jest.fn(),
    },
}));

describe("ProfileCard - Details - Form Validation", () => {
    const mockToken = "mock-token";
    const mockUser = {
        username: "testuser",
        email: "test@example.com",
        created_at: "2022-01-01",
    };

    beforeEach(async () => {
        (getProfile as jest.Mock).mockResolvedValueOnce({ user: mockUser });

        render(<ProfileCard token={mockToken} />);

        await waitFor(() =>
            screen.getByRole("button", { name: /update profile/i })
        );

        const updateProfileButton = screen.getByRole("button", {
            name: /update profile/i,
        });
        fireEvent.click(updateProfileButton);
    });

    it("displays errors for empty form fields", async () => {
        const usernameInput = screen.getByPlaceholderText(/username/i);
        const emailInput = screen.getByPlaceholderText(/email/i);

        fireEvent.change(usernameInput, { target: { value: "" } });
        fireEvent.change(emailInput, { target: { value: "" } });

        await waitFor(() => {
            const usernameError = screen.getByText(/username is required/i);
            const emailError = screen.getByText(/email is required/i);

            expect(usernameError).toBeInTheDocument();
            expect(emailError).toBeInTheDocument();
        });
    });

    it("displays error for invalid email", async () => {
        const emailInput = screen.getByPlaceholderText(/email/i);

        fireEvent.change(emailInput, { target: { value: "" } });
        await userEvent.type(emailInput, "invalidemail");

        await waitFor(() => {
            const emailError = screen.getByText(/invalid email format/i);

            expect(emailError).toBeInTheDocument();
        });
    });
});

describe("ProfileCard - Password - Form Validation", () => {
    const mockToken = "mock-token";
    const mockUser = {
        username: "testuser",
        email: "test@example.com",
        created_at: "2022-01-01",
    };

    beforeEach(async () => {
        (getProfile as jest.Mock).mockResolvedValueOnce({ user: mockUser });

        render(<ProfileCard token={mockToken} />);

        await waitFor(() =>
            screen.getByRole("button", { name: /update profile/i })
        );

        const changePasswordButton = screen.getByRole("button", {
            name: /change password/i,
        });
        fireEvent.click(changePasswordButton);
    });

    it("displays errors for empty form fields", async () => {
        const saveButton = screen.getByRole("button", {
            name: /save/i,
        });
        fireEvent.click(saveButton);

        await waitFor(() => {
            const currentPasswordError = screen.getByText(
                /^current password is required$/i
            );
            const newPasswordError = screen.getByText(
                /^new password is required$/i
            );
            const confirmNewPasswordError = screen.getByText(
                /^confirm new password is required$/i
            );

            expect(currentPasswordError).toBeInTheDocument();
            expect(newPasswordError).toBeInTheDocument();
            expect(confirmNewPasswordError).toBeInTheDocument();
        });
    });

    it("displays error for mismatched passwords", async () => {
        const passwordInput = screen.getByPlaceholderText(/^new password$/i);
        const confirmPasswordInput = screen.getByPlaceholderText(
            /^confirm new password$/i
        );

        await userEvent.type(passwordInput, "password123");
        await userEvent.type(confirmPasswordInput, "differentpassword");

        await waitFor(() => {
            const confirmPasswordError =
                screen.getByText(/passwords must match/i);

            expect(confirmPasswordError).toBeInTheDocument();
        });
    });

    it("displays error for short password", async () => {
        const passwordInput = screen.getByPlaceholderText(/^new password$/i);

        await userEvent.type(passwordInput, "123");

        await waitFor(() => {
            const confirmPasswordError = screen.getByText(
                /password must be at least 8 characters/i
            );

            expect(confirmPasswordError).toBeInTheDocument();
        });
    });
});

describe("ProfileCard - Details - Form API Interaction", () => {
    const mockToken = "mock-token";
    const mockUser = {
        username: "testuser",
        email: "test@example.com",
        created_at: "2022-01-01",
    };

    beforeEach(async () => {
        (getProfile as jest.Mock).mockResolvedValueOnce({ user: mockUser });
        render(<ProfileCard token={mockToken} />);

        await waitFor(() =>
            screen.getByRole("button", { name: /update profile/i })
        );

        const updateProfileButton = screen.getByRole("button", {
            name: /update profile/i,
        });
        fireEvent.click(updateProfileButton);
    });

    it("displays success message on successful form submission", async () => {
        const mockSuccess = {
            response: {
                data: {
                    message: "Profile updated successfully!",
                },
            },
        };
        (updateProfile as jest.Mock).mockResolvedValueOnce(mockSuccess);

        const updatedUsername = "newusername";
        const updatedEmail = "new@example.com";

        const usernameInput = screen.getByPlaceholderText(/username/i);
        const emailInput = screen.getByPlaceholderText(/email/i);

        await userEvent.clear(usernameInput);
        await userEvent.type(usernameInput, updatedUsername);

        await userEvent.clear(emailInput);
        await userEvent.type(emailInput, updatedEmail);

        const saveButton = screen.getByRole("button", { name: /save/i });
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(updateProfile).toHaveBeenCalledWith(
                mockToken,
                updatedUsername,
                updatedEmail
            );

            expect(toast.success).toHaveBeenCalledWith(
                mockSuccess.response.data.message
            );
        });
    });

    it("displays error message on invalid form submission", async () => {
        const mockError = {
            response: {
                data: {
                    message: "An error occurred. Please try again.",
                },
            },
        };
        (updateProfile as jest.Mock).mockRejectedValueOnce(mockError);

        const saveButton = screen.getByRole("button", { name: /save/i });
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith(
                mockError.response.data.message
            );
        });
    });
});

describe("ProfileCard - Password - Form API Interaction", () => {
    const mockToken = "mock-token";
    const mockUser = {
        username: "testuser",
        email: "test@example.com",
        created_at: "2022-01-01",
    };

    beforeEach(async () => {
        (getProfile as jest.Mock).mockResolvedValueOnce({ user: mockUser });
        render(<ProfileCard token={mockToken} />);

        await waitFor(() =>
            screen.getByRole("button", { name: /update profile/i })
        );

        const changePasswordButton = screen.getByRole("button", {
            name: /change password/i,
        });
        fireEvent.click(changePasswordButton);
    });

    it("displays success message on successful form submission", async () => {
        const mockSuccess = {
            response: {
                data: {
                    message: "Password changed successfully!",
                },
            },
        };
        (changePassword as jest.Mock).mockResolvedValueOnce(mockSuccess);

        const currentPassword = "currentPassword";
        const newPassword = "newPassword";
        const confirmNewPassword = "newPassword";

        const currentPasswordInput =
            screen.getByPlaceholderText(/^current password$/i);
        const newPasswordInput = screen.getByPlaceholderText(/^new password$/i);
        const confirmPasswordInput = screen.getByPlaceholderText(
            /^confirm new password$/i
        );

        await userEvent.type(currentPasswordInput, currentPassword);
        await userEvent.type(newPasswordInput, newPassword);
        await userEvent.type(confirmPasswordInput, confirmNewPassword);

        const saveButton = screen.getByRole("button", { name: /save/i });
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(toast.success).toHaveBeenCalledWith(
                mockSuccess.response.data.message
            );
        });
    });

    it("displays error message on invalid form submission", async () => {
        const mockError = {
            response: {
                data: {
                    message: "An error occurred. Please try again.",
                },
            },
        };
        (changePassword as jest.Mock).mockRejectedValueOnce(mockError);

        const currentPassword = "currentPassword";
        const newPassword = "newPassword";
        const confirmNewPassword = "newPassword";

        const currentPasswordInput =
            screen.getByPlaceholderText(/^current password$/i);
        const newPasswordInput = screen.getByPlaceholderText(/^new password$/i);
        const confirmPasswordInput = screen.getByPlaceholderText(
            /^confirm new password$/i
        );

        await userEvent.type(currentPasswordInput, currentPassword);
        await userEvent.type(newPasswordInput, newPassword);
        await userEvent.type(confirmPasswordInput, confirmNewPassword);

        const saveButton = screen.getByRole("button", { name: /save/i });
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith(
                mockError.response.data.message
            );
        });
    });
});
