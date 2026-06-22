import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { updateProfile } from "../services/api";

export default function ProfilePage() {
  const { user, updateUser } = useAuth();

  const [email, setEmail] = useState(user?.email ?? "");
  const [emailError, setEmailError] = useState("");
  const [emailSuccess, setEmailSuccess] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setEmailError("");
    setEmailSuccess(false);
    if (email.trim().toLowerCase() === user.email) {
      setEmailError("That's already your email address.");
      return;
    }
    setEmailLoading(true);
    try {
      const { data } = await updateProfile({ email: email.trim() });
      updateUser(data);
      setEmailSuccess(true);
    } catch (err) {
      setEmailError(err.response?.data?.error || "Failed to update email.");
    } finally {
      setEmailLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess(false);
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords don't match.");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
      return;
    }
    setPasswordLoading(true);
    try {
      await updateProfile({ current_password: currentPassword, new_password: newPassword });
      setPasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordError(err.response?.data?.error || "Failed to update password.");
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="container py-4" style={{ maxWidth: "560px" }}>
      <h1 className="mb-4">Profile</h1>

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body p-4">
          <h5 className="fw-bold mb-3">Email address</h5>
          {emailError && (
            <div className="alert alert-danger py-2 small">{emailError}</div>
          )}
          {emailSuccess && (
            <div className="alert alert-success py-2 small">Email updated successfully.</div>
          )}
          <form onSubmit={handleEmailSubmit}>
            <div className="mb-3">
              <label className="form-label" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={emailLoading}>
              {emailLoading ? "Saving…" : "Update email"}
            </button>
          </form>
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body p-4">
          <h5 className="fw-bold mb-3">Change password</h5>
          {passwordError && (
            <div className="alert alert-danger py-2 small">{passwordError}</div>
          )}
          {passwordSuccess && (
            <div className="alert alert-success py-2 small">Password updated successfully.</div>
          )}
          <form onSubmit={handlePasswordSubmit}>
            <div className="mb-3">
              <label className="form-label" htmlFor="current-password">Current password</label>
              <input
                id="current-password"
                type="password"
                className="form-control"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label" htmlFor="new-password">New password</label>
              <input
                id="new-password"
                type="password"
                className="form-control"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>
            <div className="mb-3">
              <label className="form-label" htmlFor="confirm-password">Confirm new password</label>
              <input
                id="confirm-password"
                type="password"
                className="form-control"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={passwordLoading}>
              {passwordLoading ? "Saving…" : "Update password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
