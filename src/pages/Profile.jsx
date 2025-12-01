// src/pages/Profile.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../firebase/AuthContext.jsx";
import { uploadAvatar } from "../firebase/uploadManager.js";
import { auth } from "../firebase/index.js";
import { db } from "../firebase/index.js";

import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  deleteDoc,
} from "firebase/firestore";
import {
  updateProfile,
  updateEmail,
  updatePassword,
  deleteUser,
  multiFactor,
  PhoneAuthProvider,
  RecaptchaVerifier,
} from "firebase/auth";

export default function Profile() {
  const { user } = useAuth(); // Firebase Auth user

  // Basic profile fields
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");

  // Avatar
  const [avatarPreview, setAvatarPreview] = useState(user?.photoURL || "");
  const [avatarFile, setAvatarFile] = useState(null);

  // Account email & password
  const [email, setEmail] = useState(user?.email || "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // MFA (phone 2-step verification)
  const [mfaPhone, setMfaPhone] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [mfaVerificationId, setMfaVerificationId] = useState("");
  const [mfaStage, setMfaStage] = useState<"idle" | "code">("idle");

  // UI state
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingSecurity, setSavingSecurity] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [mfaStatus, setMfaStatus] = useState("");
  const [mfaError, setMfaError] = useState("");

  // --------------------------------------------------
  // Load extra profile data from Firestore
  // --------------------------------------------------
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    (async () => {
      setLoading(true);
      setError("");
      try {
        const ref = doc(db, "users", user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          if (data.displayName && !displayName) {
            setDisplayName(data.displayName);
          }
          if (data.phone) setPhone(data.phone);
          if (data.bio) setBio(data.bio);
          if (data.photoURL && !avatarPreview) {
            setAvatarPreview(data.photoURL);
          }
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // --------------------------------------------------
  // Avatar handling
  // --------------------------------------------------
  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  // --------------------------------------------------
  // Save basic profile (name, avatar, phone, bio)
  // --------------------------------------------------
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    setError("");
    setStatus("");
    setSavingProfile(true);

    try {
      let photoURL = avatarPreview || user.photoURL || "";

      // Upload new avatar if provided
      if (avatarFile) {
        const uploadedUrl = await uploadAvatar(avatarFile);
        if (uploadedUrl) {
          photoURL = uploadedUrl;
        }
      }

      // Update Firebase Auth profile
      await updateProfile(auth.currentUser, {
        displayName: displayName || user.displayName || "",
        photoURL: photoURL || null,
      });

      // Update Firestore profile document
      const ref = doc(db, "users", user.uid);
      await setDoc(
        ref,
        {
          displayName: displayName || null,
          phone: phone || null,
          bio: bio || null,
          photoURL: photoURL || null,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      setStatus("Profile updated successfully.");
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to update profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  // --------------------------------------------------
  // Security: email / password changes
  // --------------------------------------------------
  const handleEmailChange = async (e) => {
    e.preventDefault();
    if (!user || !email || email === user.email) return;

    setError("");
    setStatus("");
    setSavingSecurity(true);

    try {
      await updateEmail(auth.currentUser, email.trim());
      const ref = doc(db, "users", user.uid);
      await setDoc(
        ref,
        { email: email.trim(), updatedAt: serverTimestamp() },
        { merge: true }
      );
      setStatus("Email updated. You may need to verify it via email from Firebase.");
    } catch (err) {
      console.error(err);
      if (err.code === "auth/requires-recent-login") {
        setError(
          "Please log out and log back in before changing your email (Firebase requires a recent login)."
        );
      } else {
        setError(err.message || "Failed to update email.");
      }
    } finally {
      setSavingSecurity(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!user) return;

    if (!newPassword || newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setError("");
    setStatus("");
    setSavingSecurity(true);

    try {
      await updatePassword(auth.currentUser, newPassword);
      setNewPassword("");
      setConfirmPassword("");
      setStatus("Password updated successfully.");
    } catch (err) {
      console.error(err);
      if (err.code === "auth/requires-recent-login") {
        setError(
          "Please log out and log back in before changing your password (Firebase requires a recent login)."
        );
      } else {
        setError(err.message || "Failed to update password.");
      }
    } finally {
      setSavingSecurity(false);
    }
  };

  // --------------------------------------------------
  // Danger zone: delete account
  // --------------------------------------------------
  const handleDeleteAccount = async () => {
    if (!user) return;
    const sure = window.confirm(
      "This will permanently delete your HI AWTO account and profile data. This cannot be undone. Continue?"
    );
    if (!sure) return;

    setError("");
    setStatus("");
    setDeleting(true);

    try {
      // Delete Firestore user profile first (optional)
      const ref = doc(db, "users", user.uid);
      await deleteDoc(ref).catch(() => {});

      // Delete Auth user
      await deleteUser(auth.currentUser);

      // After delete, you might want to hard refresh
      window.location.href = "/";
    } catch (err) {
      console.error(err);
      if (err.code === "auth/requires-recent-login") {
        setError(
          "Please log out and back in, then try deleting your account again (Firebase requires a recent login)."
        );
      } else {
        setError(err.message || "Failed to delete account.");
      }
    } finally {
      setDeleting(false);
    }
  };

  // --------------------------------------------------
  // MFA: enroll SMS phone as second factor
  // --------------------------------------------------
  const ensureRecaptchaVerifier = () => {
    // Reuse an existing verifier if present
    if (window._hiAwtoMfaRecaptcha) {
      return window._hiAwtoMfaRecaptcha;
    }
    const verifier = new RecaptchaVerifier(
      "mfa-recaptcha-container",
      {
        size: "invisible",
      },
      auth
    );
    window._hiAwtoMfaRecaptcha = verifier;
    return verifier;
  };

  const handleStartMfaEnroll = async (e) => {
    e.preventDefault();
    setMfaError("");
    setMfaStatus("");

    if (!user) {
      setMfaError("You must be logged in to enable MFA.");
      return;
    }
    if (!mfaPhone || !mfaPhone.startsWith("+")) {
      setMfaError("Enter a valid phone number in E.164 format, e.g. +15555555555.");
      return;
    }

    try {
      const verifier = ensureRecaptchaVerifier();

      // Start an MFA session
      const mfaSession = await multiFactor(auth.currentUser).getSession();

      const phoneProvider = new PhoneAuthProvider(auth);
      const verificationId = await phoneProvider.verifyPhoneNumber(
        {
          phoneNumber: mfaPhone,
          session: mfaSession,
        },
        verifier
      );

      setMfaVerificationId(verificationId);
      setMfaStage("code");
      setMfaStatus("We sent a verification code via SMS. Enter it below to complete setup.");
    } catch (err) {
      console.error(err);
      setMfaError(err.message || "Failed to start MFA enrollment.");
    }
  };

  const handleCompleteMfaEnroll = async (e) => {
    e.preventDefault();
    setMfaError("");
    setMfaStatus("");

    if (!mfaVerificationId || !mfaCode) {
      setMfaError("Enter the verification code that was sent to your phone.");
      return;
    }

    try {
      const cred = PhoneAuthProvider.credential(mfaVerificationId, mfaCode);
      await multiFactor(auth.currentUser).enroll(cred, "Phone");

      setMfaStatus("SMS-based 2-step verification has been enabled for your account.");
      setMfaStage("idle");
      setMfaVerificationId("");
      setMfaCode("");
    } catch (err) {
      console.error(err);
      setMfaError(err.message || "Failed to complete MFA enrollment.");
    }
  };

  // --------------------------------------------------
  // Render
  // --------------------------------------------------
  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <p className="text-gray-600 text-sm">
          You need to be logged in to view your profile.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <p className="text-gray-500 text-sm">Loading profile…</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
          My Profile
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Update your account details, security settings, and profile photo.
        </p>
      </div>

      {(error || status) && (
        <div className="space-y-2">
          {error && (
            <div className="rounded bg-red-50 text-red-700 px-3 py-2 text-sm">
              {error}
            </div>
          )}
          {status && (
            <div className="rounded bg-green-50 text-green-700 px-3 py-2 text-sm">
              {status}
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------
          Basic profile card
      ------------------------------------------------- */}
      <form
        onSubmit={handleProfileSubmit}
        className="bg-white rounded-xl shadow p-6 space-y-6"
      >
        <h2 className="font-semibold text-slate-800 mb-2">
          Profile details
        </h2>

        {/* Avatar */}
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Avatar preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-slate-500 text-xs">No photo</span>
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-slate-800">
              Profile photo
            </p>
            <p className="text-xs text-slate-500 mb-1">
              Upload a square image for best results.
            </p>
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="text-xs text-slate-600"
            />
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Full name
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Phone (optional)
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
            placeholder="(555) 555-5555"
          />
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            About you (optional)
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
            placeholder="Tell us about yourself or your home search."
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={savingProfile}
            className="inline-flex items-center justify-center px-6 py-2 rounded-full bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-60"
          >
            {savingProfile ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>

      {/* ------------------------------------------------
          Account security card
      ------------------------------------------------- */}
      <div className="bg-white rounded-xl shadow p-6 space-y-6">
        <h2 className="font-semibold text-slate-800">
          Account security
        </h2>

        {/* Email */}
        <form
          onSubmit={handleEmailChange}
          className="space-y-3 border-b border-slate-100 pb-4"
        >
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
            />
            <p className="text-xs text-slate-500 mt-1">
              Changing your email may require re-authentication and email
              verification.
            </p>
          </div>
          <button
            type="submit"
            disabled={savingSecurity || email === user.email}
            className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-slate-800 text-white text-xs font-semibold hover:bg-slate-900 disabled:opacity-50"
          >
            Update email
          </button>
        </form>

        {/* Password */}
        <form onSubmit={handlePasswordChange} className="space-y-3">
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                New password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Confirm password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
              />
            </div>
          </div>
          <p className="text-xs text-slate-500">
            Password must be at least 6 characters. You may be asked to log in
            again if your session is old.
          </p>
          <button
            type="submit"
            disabled={savingSecurity}
            className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-slate-800 text-white text-xs font-semibold hover:bg-slate-900 disabled:opacity-50"
          >
            Update password
          </button>
        </form>
      </div>

      {/* ------------------------------------------------
          MFA & phone 2-step verification
      ------------------------------------------------- */}
      <div className="bg-white rounded-xl shadow p-6 space-y-4">
        <h2 className="font-semibold text-slate-800">
          2-Step verification (MFA)
        </h2>
        <p className="text-xs text-slate-500">
          Add a phone number so Firebase can send a one-time code when you
          sign in. Make sure Phone Auth is enabled in your Firebase console.
        </p>

        {mfaError && (
          <div className="rounded bg-red-50 text-red-700 px-3 py-2 text-xs">
            {mfaError}
          </div>
        )}
        {mfaStatus && (
          <div className="rounded bg-green-50 text-green-700 px-3 py-2 text-xs">
            {mfaStatus}
          </div>
        )}

        {/* Step 1: enter phone & request code */}
        {mfaStage === "idle" && (
          <form
            onSubmit={handleStartMfaEnroll}
            className="space-y-3"
          >
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Phone number for codes
              </label>
              <input
                type="tel"
                value={mfaPhone}
                onChange={(e) => setMfaPhone(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                placeholder="+15555555555"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700"
            >
              Send verification code
            </button>
          </form>
        )}

        {/* Step 2: enter SMS code */}
        {mfaStage === "code" && (
          <form onSubmit={handleCompleteMfaEnroll} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                SMS verification code
              </label>
              <input
                type="text"
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                placeholder="123456"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700"
              >
                Verify & enable 2-step
              </button>
              <button
                type="button"
                onClick={() => {
                  setMfaStage("idle");
                  setMfaVerificationId("");
                  setMfaCode("");
                }}
                className="inline-flex items-center justify-center px-4 py-1.5 rounded-full border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Invisible recaptcha anchor */}
        <div id="mfa-recaptcha-container" />
      </div>

      {/* ------------------------------------------------
          Danger zone
      ------------------------------------------------- */}
      <div className="bg-white rounded-xl shadow p-6 border border-red-100">
        <h2 className="font-semibold text-red-700">Danger zone</h2>
        <p className="text-xs text-red-500 mt-1 mb-3">
          Deleting your account will remove your HI AWTO profile and sign-in
          access. This cannot be undone.
        </p>
        <button
          type="button"
          onClick={handleDeleteAccount}
          disabled={deleting}
          className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-red-600 text-white text-xs font-semibold hover:bg-red-700 disabled:opacity-60"
        >
          {deleting ? "Deleting account…" : "Delete my account"}
        </button>
      </div>
    </div>
  );
}
