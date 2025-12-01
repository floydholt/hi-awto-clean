// src/pages/ViewThread.jsx
import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../firebase/AuthContext.jsx";
import {
  getThread,
  sendMessage,
  setThreadTyping,
  markThreadMessagesRead,
  pinMessage,
} from "../firebase/messages.js";
import { uploadChatAttachmentsWithProgress } from "../firebase/uploadManager.js";
import { db } from "../firebase/config.js";
import {
  doc,
  onSnapshot,
  collection,
  query,
  orderBy,
} from "firebase/firestore";

export default function ViewThread() {
  const { threadId } = useParams();
  const { user } = useAuth();

  const [thread, setThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState("");

  const [attachmentFiles, setAttachmentFiles] = useState([]);
  const [attachmentPreviews, setAttachmentPreviews] = useState([]);
  const [uploadProgress, setUploadProgress] = useState([]);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef(null);

  const [isDragging, setIsDragging] = useState(false);
  const dragCounterRef = useRef(0);

  const [typingUsers, setTypingUsers] = useState([]);
  const typingTimeoutRef = useRef(null);
  const typingActiveRef = useRef(false);

  // LIGHTBOX
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [zoom, setZoom] = useState(1);

  const touchStartXRef = useRef(null);
  const touchEndXRef = useRef(null);
  const lastTapRef = useRef(0);

  const SWIPE_THRESHOLD = 50;
  const DOUBLE_TAP_THRESHOLD = 250;

  // PINNED MESSAGES
  const [pinnedModalOpen, setPinnedModalOpen] = useState(false);
  const messageRefs = useRef({});

  // File settings
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "video/mp4",
    "video/quicktime",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];
  const MAX_FILE_MB = 25;
  const MAX_TOTAL_MB = 50;
  const bytesToMB = (b) => b / (1024 * 1024);


    // If device supports sharing binary files
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        title: "Share Image",
        text: "Check out this image!",
        files: [file],
      });
      return;
    }

    // If it supports link-only share (older devices)
    if (navigator.share) {
      await navigator.share({
        title: "Share Image",
        url: url,
      });
      return;
    }

    // Fallback
    await navigator.clipboard.writeText(url);
    alert("Link copied to clipboard. Your device does not support direct sharing.");
  } catch (err) {
    console.error("Share failed:", err);
    alert("Unable to share this image.");
  }
};


  // Load thread meta
  useEffect(() => {
    if (!threadId) return;
    (async () => {
      const t = await getThread(threadId);
      setThread(t || null);
      setLoading(false);
    })();
  }, [threadId]);

  // Realtime messages
  useEffect(() => {
    if (!threadId) return;

    const msgsRef = collection(db, `threads/${threadId}/messages`);
    const q = query(msgsRef, orderBy("createdAt", "asc"));

    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    return unsub;
  }, [threadId]);

  // Realtime typing + thread updates
  useEffect(() => {
    if (!threadId) return;

    const ref = doc(db, "threads", threadId);
    const unsub = onSnapshot(ref, (snap) => {
      if (!snap.exists()) return;
      const data = snap.data();
      setThread({ id: snap.id, ...data });

      const typing = data.typing || {};
      const others = Object.entries(typing)
        .filter(([uid, isOn]) => uid !== user.uid && isOn)
        .map(([uid]) => uid);

      setTypingUsers(others);
    });

    return unsub;
  }, [threadId, user]);

  // Mark thread messages as read
  useEffect(() => {
    if (!user || !threadId || messages.length === 0) return;
    markThreadMessagesRead(threadId, user.uid);
  }, [messages, threadId, user]);

  // -----------------------------
  // SAVE TO PHOTOS (MOBILE)
  // -----------------------------
  const handleSaveToPhotos = async (imageUrl) => {
    try {
      const isMobile = /iPhone|iPad|iPod|Android/i.test(
        navigator.userAgent
      );

      // Native share sheet with file (best UX)
      if (isMobile && navigator.share) {
        const blob = await fetch(imageUrl).then((r) => r.blob());
        const file = new File([blob], "chat-image.jpg", {
          type: blob.type,
        });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: "Save Image",
            files: [file],
          });
          return;
        }
      }

      // Fallback: force a download via blob (works on iOS Safari)
      const blob = await fetch(imageUrl).then((r) => r.blob());
      const blobUrl = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = "chat-image.jpg";
      a.click();

      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Save to Photos error:", err);
    }
  };

  // -----------------------------
  // COPY IMAGE TO CLIPBOARD
  // -----------------------------
  const handleCopyImage = async (imageUrl) => {
    try {
      if (
        typeof window !== "undefined" &&
        window.ClipboardItem &&
        navigator.clipboard &&
        navigator.clipboard.write
      ) {
        const blob = await fetch(imageUrl).then((r) => r.blob());
        const item = new ClipboardItem({ [blob.type]: blob });
        await navigator.clipboard.write([item]);
        alert("Image copied to clipboard.");
        return;
      }

      // Fallback: copy URL as text
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(imageUrl);
        alert("Image link copied to clipboard.");
        return;
      }

      alert("Copy not supported in this browser.");
    } catch (err) {
      console.error("Copy image failed:", err);
      alert("Unable to copy image.");
    }
  };

  // -----------------------------
  // FILE ATTACHMENTS
  // -----------------------------
  function processFiles(files) {
    let valid = [];
    let previews = [];
    let errors = [];

    files.forEach((file) => {
      const sizeMb = bytesToMB(file.size);

      if (!allowedTypes.includes(file.type)) {
        errors.push(`❌ Unsupported: ${file.name}`);
        return;
      }
      if (sizeMb > MAX_FILE_MB) {
        errors.push(`❌ Too big: ${file.name}`);
        return;
      }

      valid.push(file);
      previews.push({
        name: file.name,
        type: file.type,
        url: URL.createObjectURL(file),
        size: file.size,
      });
    });

    const totalMb = valid.reduce((s, f) => s + bytesToMB(f.size), 0);
    if (totalMb > MAX_TOTAL_MB) {
      errors.push(`❌ Total exceeds ${MAX_TOTAL_MB} MB`);
      valid = [];
      previews.forEach((p) => URL.revokeObjectURL(p.url));
      previews = [];
    }

    setUploadError(errors.join("\n"));
    setAttachmentFiles(valid);
    setAttachmentPreviews(previews);
    setUploadProgress(valid.map(() => 0));

    if (errors.length > 0 && fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  const handleFileChange = (e) => {
    processFiles(Array.from(e.target.files || []));
  };

  const clearAttachments = () => {
    attachmentPreviews.forEach((p) => URL.revokeObjectURL(p.url));
    setAttachmentFiles([]);
    setAttachmentPreviews([]);
    setUploadProgress([]);
    setUploadError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // -----------------------------
  // DRAG & DROP
  // -----------------------------
  const handleDragEnter = (e) => {
    e.preventDefault();
    dragCounterRef.current++;
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    dragCounterRef.current--;
    if (dragCounterRef.current <= 0) setIsDragging(false);
  };

  const handleDragOver = (e) => e.preventDefault();

  const handleDrop = (e) => {
    e.preventDefault();
    dragCounterRef.current = 0;
    setIsDragging(false);
    processFiles(Array.from(e.dataTransfer.files || []));
  };

  // -----------------------------
  // SEND MESSAGE
  // -----------------------------
  const handleSend = async (e) => {
    e.preventDefault();

    if (!newMessage.trim() && attachmentFiles.length === 0) {
      setUploadError("Message or attachment required");
      return;
    }

    setSending(true);
    setUploadError("");

    try {
      let attachments = [];

      if (attachmentFiles.length > 0) {
        attachments = await uploadChatAttachmentsWithProgress(
          threadId,
          attachmentFiles,
          (index, percent) => {
            setUploadProgress((prev) => {
              const copy = [...prev];
              copy[index] = percent;
              return copy;
            });
          }
        );
      }

      await sendMessage(threadId, {
        text: newMessage.trim(),
        senderId: user.uid,
        senderName: user.displayName || user.email || "User",
        attachments,
        readBy: [user.uid],
      });

      setNewMessage("");
      clearAttachments();
    } catch (err) {
      console.error(err);
      setUploadError("Failed to send message");
    }

    setSending(false);
    typingActiveRef.current = false;
    setThreadTyping(threadId, user.uid, false);
  };

  // -----------------------------
  // TYPING INDICATOR
  // -----------------------------
  const handleInputChange = (e) => {
    const value = e.target.value;
    setNewMessage(value);

    if (!typingActiveRef.current) {
      typingActiveRef.current = true;
      setThreadTyping(threadId, user.uid, true);
    }

    if (typingTimeoutRef.current)
      clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      typingActiveRef.current = false;
      setThreadTyping(threadId, user.uid, false);
    }, 1800);
  };

  const handleBlur = () => {
    typingActiveRef.current = false;
    setThreadTyping(threadId, user.uid, false);
  };

  // -----------------------------
  // IMAGE ATTACHMENTS FOR LIGHTBOX
  // -----------------------------
  const imageAttachments = [];
  messages.forEach((m) => {
    (m.attachments || []).forEach((att) => {
      if ((att.contentType || "").startsWith("image/")) {
        imageAttachments.push(att);
      }
    });
  });

  // LIGHTBOX NAV
  const nextImage = () => {
    setLightboxIndex((i) => (i + 1) % imageAttachments.length);
    setZoom(1);
  };

  const prevImage = () => {
    setLightboxIndex(
      (i) =>
        (i - 1 + imageAttachments.length) %
        imageAttachments.length
    );
    setZoom(1);
  };

  const closeLightbox = () => setLightboxOpen(false);

  const zoomIn = () => setZoom((z) => Math.min(3, z + 0.25));
  const zoomOut = () => setZoom((z) => Math.max(0.5, z - 0.25));
  const resetZoom = () => setZoom(1);

  const handleDoubleTap = () => {
    const now = Date.now();
    if (now - lastTapRef.current < DOUBLE_TAP_THRESHOLD) {
      setZoom((z) => (z === 1 ? 2 : 1));
    }
    lastTapRef.current = now;
  };

  const handleLightboxTouchStart = (e) => {
    const x = e.touches[0].clientX;
    touchStartXRef.current = x;
    touchEndXRef.current = x;
  };

  const handleLightboxTouchMove = (e) => {
    touchEndXRef.current = e.touches[0].clientX;
  };

  const handleLightboxTouchEnd = () => {
    const start = touchStartXRef.current;
    const end = touchEndXRef.current;
    if (!start || !end) return;

    const delta = end - start;

    if (Math.abs(delta) >= SWIPE_THRESHOLD) {
      if (delta < 0) nextImage();
      else prevImage();
      setZoom(1);
    }
  };

  // KEYBOARD SHORTCUTS
  const handleKeyDown = useCallback(
    (e) => {
      if (!lightboxOpen) return;

      if (e.key === "ArrowRight") nextImage();
      if (e.key === "ArrowLeft") prevImage();
      if (e.key === "Escape") closeLightbox();
    },
    [lightboxOpen]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () =>
      document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // PINNED MESSAGES
  const pinnedMessages = messages.filter((m) => m.pinned);

  const handleTogglePin = async (messageId, currentPinned) => {
    try {
      await pinMessage(threadId, messageId, !currentPinned);
    } catch (err) {
      console.error("Failed to pin/unpin", err);
    }
  };

  const scrollToMessage = (messageId) => {
    const el = messageRefs.current[messageId];
    if (el) {
      el.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
    setPinnedModalOpen(false);
  };

  // RENDER
  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10 text-gray-600">
        Loading conversation…
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        Thread not found.
      </div>
    );
  }

  const otherParticipants =
    (thread.participants || []).filter((uid) => uid !== user?.uid) ||
    [];

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 flex flex-col gap-4">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <Link
          to="/messages"
          className="text-blue-600 text-xs hover:underline"
        >
          ← Back
        </Link>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setPinnedModalOpen(true)}
            className="flex items-center gap-1 text-xs px-3 py-1 rounded-full border border-slate-300 hover:bg-slate-50"
          >
            📌
            <span className="font-medium">
              {pinnedMessages.length} pinned
            </span>
          </button>

          <h1 className="text-sm sm:text-lg font-semibold text-slate-800">
            Conversation
          </h1>
        </div>
      </div>

      {/* MESSAGES */}
      <div className="bg-white rounded-xl shadow p-4 max-h-[60vh] overflow-y-auto space-y-4">
        {messages.map((m) => {
          const isMine = m.senderId === user.uid;
          const readBy = m.readBy || [];
          const attachments = m.attachments || [];
          const isPinned = !!m.pinned;

          const everyoneRead =
            isMine &&
            otherParticipants.length > 0 &&
            otherParticipants.every((id) =>
              readBy.includes(id)
            );

          return (
            <div
              key={m.id}
              ref={(el) => (messageRefs.current[m.id] = el)}
              className={`relative flex flex-col ${
                isMine ? "items-end" : "items-start"
              }`}
            >
              {/* PIN BUTTON */}
              <button
                type="button"
                onClick={() => handleTogglePin(m.id, isPinned)}
                className={`absolute -top-2 ${
                  isMine ? "right-0" : "left-0"
                } px-2 py-0.5 text-xs rounded-full shadow-sm ${
                  isPinned
                    ? "bg-yellow-200 text-yellow-900"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                }`}
              >
                {isPinned ? "📌 Pinned" : "📍 Pin"}
              </button>

              {/* BUBBLE */}
              <div
                className={`mt-2 max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                  isMine
                    ? "bg-blue-600 text-white rounded-br-sm"
                    : "bg-gray-100 text-slate-800 rounded-bl-sm"
                }`}
              >
                {!isMine && m.senderName && (
                  <div className="text-[11px] opacity-70 font-semibold mb-1">
                    {m.senderName}
                  </div>
                )}

                {m.text && <div className="mb-1">{m.text}</div>}

                {attachments.length > 0 && (
                  <div className="space-y-2 mt-1">
                    {attachments.map((att, idx) => {
                      const type = att.contentType || "";

                      if (type.startsWith("image/")) {
                        const imgIndex = imageAttachments.findIndex(
                          (x) => x.url === att.url
                        );
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              if (imgIndex >= 0) {
                                setLightboxIndex(imgIndex);
                                setZoom(1);
                                setLightboxOpen(true);
                              }
                            }}
                            className="block rounded-lg overflow-hidden focus:outline-none"
                          >
                            <img
                              src={att.url}
                              alt={att.name || "Image"}
                              className="max-h-40 rounded-lg object-cover"
                            />
                          </button>
                        );
                      }

                      if (type.startsWith("video/")) {
                        return (
                          <video
                            key={idx}
                            src={att.url}
                            controls
                            className="max-h-40 rounded-lg"
                          />
                        );
                      }

                      return (
                        <a
                          key={idx}
                          href={att.url}
                          target="_blank"
                          rel="noreferrer"
                          className="underline text-xs flex items-center gap-1"
                        >
                          📎 {att.name || "Attachment"}
                        </a>
                      );
                    })}
                  </div>
                )}

                {isPinned && (
                  <div className="mt-1 text-[10px] opacity-80">
                    📌 Pinned message
                  </div>
                )}
              </div>

              {everyoneRead && (
                <span className="text-[11px] text-gray-400 mt-1">
                  Seen
                </span>
              )}
            </div>
          );
        })}

        {typingUsers.length > 0 && (
          <div className="text-xs text-gray-500 italic">
            {typingUsers.length === 1
              ? "Someone is typing…"
              : "Multiple people are typing…"}
          </div>
        )}
      </div>

      {/* ERROR */}
      {uploadError && (
        <div className="bg-red-50 text-red-600 text-xs rounded-lg px-3 py-2 whitespace-pre-line">
          {uploadError}
        </div>
      )}

      {/* ATTACHMENT PREVIEWS */}
      {attachmentPreviews.length > 0 && (
        <div className="bg-white rounded-xl shadow p-3 flex flex-col gap-3">
          {attachmentPreviews.map((p, idx) => {
            const isImage = p.type.startsWith("image/");
            const isVideo = p.type.startsWith("video/");
            return (
              <div
                key={idx}
                className="flex items-center gap-2 border rounded-lg px-2 py-1 text-xs"
              >
                {isImage && (
                  <img
                    src={p.url}
                    alt={p.name}
                    className="h-10 w-10 rounded object-cover"
                  />
                )}
                {isVideo && <span>🎬</span>}
                {!isImage && !isVideo && <span>📎</span>}

                <span className="max-w-[150px] truncate">
                  {p.name}
                </span>

                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden ml-3">
                  <div
                    className="h-full bg-blue-600 transition-all"
                    style={{
                      width: `${uploadProgress[idx] || 0}%`,
                    }}
                  />
                </div>

                <span className="text-[10px] text-gray-500 w-10 text-right">
                  {uploadProgress[idx] || 0}%
                </span>
              </div>
            );
          })}

          <button
            type="button"
            onClick={clearAttachments}
            className="text-red-600 text-xs underline self-end"
          >
            Clear attachments
          </button>
        </div>
      )}

      {/* COMPOSER */}
      <form
        onSubmit={handleSend}
        className={`bg-white rounded-xl shadow p-3 flex flex-col gap-3 border-2 transition ${
          isDragging
            ? "border-blue-400 bg-blue-50/40 border-dashed"
            : "border-transparent"
        }`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex items-center gap-3">
          <label className="cursor-pointer text-sm text-blue-600 hover:underline">
            + Add files
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
          <span className="text-xs text-gray-400">
            or drag & drop files here
          </span>
        </div>

        <div className="flex items-end gap-3">
          <textarea
            rows={2}
            value={newMessage}
            onChange={handleInputChange}
            onBlur={handleBlur}
            placeholder={
              isDragging
                ? "Drop files to attach…"
                : "Type your message…"
            }
            className="flex-1 border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-blue-500/40 focus:border-blue-500"
          />

          <button
            type="submit"
            disabled={
              sending ||
              (!newMessage.trim() &&
                attachmentFiles.length === 0)
            }
            className="px-5 py-2 bg-blue-600 text-white rounded-full text-sm hover:bg-blue-700 disabled:opacity-50"
          >
            {sending ? "Sending…" : "Send"}
          </button>
        </div>
      </form>

      {/* LIGHTBOX */}
      {lightboxOpen && imageAttachments.length > 0 && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          onClick={closeLightbox}
        >
          <div
            className="relative max-w-5xl max-h-[90vh] w-full px-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* TOP BAR */}
            <div className="flex items-center justify-between mb-3 text-white text-sm">
              <div>
                {imageAttachments[lightboxIndex]?.name || "Image"}{" "}
                <span className="opacity-60">
                  ({lightboxIndex + 1}/{imageAttachments.length})
                </span>
              </div>
              <button
                onClick={closeLightbox}
                className="px-3 py-1 border border-white/40 rounded-full hover:bg-white/10"
              >
                Close ✕
              </button>
            </div>

            {/* IMAGE */}
            <div
              className="bg-black rounded-lg overflow-hidden flex items-center justify-center max-h-[80vh]"
              onTouchStart={handleLightboxTouchStart}
              onTouchMove={handleLightboxTouchMove}
              onTouchEnd={(e) => {
                handleLightboxTouchEnd();
                handleDoubleTap();
              }}
              onDoubleClick={handleDoubleTap}
            >
              <img
                src={imageAttachments[lightboxIndex].url}
                alt={imageAttachments[lightboxIndex].name || "Image"}
                className="max-h-[80vh] max-w-full transition-transform"
                style={{ transform: `scale(${zoom})` }}
              />
            </div>

            {/* CONTROLS */}
            <div className="flex items-center justify-between mt-3 text-white text-sm">
              {/* NAV */}
              <div className="flex gap-2">
                <button
                  onClick={prevImage}
                  className="px-3 py-1 border border-white/40 rounded-full hover:bg-white/10"
                >
                  ← Prev
                </button>
                <button
                  onClick={nextImage}
                  className="px-3 py-1 border border-white/40 rounded-full hover:bg-white/10"
                >
                  Next →
                </button>
              </div>

              {/* DOWNLOAD + SAVE + COPY */}
              <div className="flex gap-2">
                <a
                  href={imageAttachments[lightboxIndex].url}
                  download={`hi-awto-chat-image-${lightboxIndex + 1}.jpg`}
                  className="px-3 py-1 border border-white/40 rounded-full hover:bg-white/10"
                >
                  ⬇ Download
                </a>

                <button
                  onClick={() =>
                    handleSaveToPhotos(
                      imageAttachments[lightboxIndex].url
                    )
                  }
                  className="px-3 py-1 border border-white/40 rounded-full hover:bg-white/10"
                >
                  📱 Save
                </button>

                <button
                  onClick={() =>
                    handleCopyImage(
                      imageAttachments[lightboxIndex].url
                    )
                  }
                  className="px-3 py-1 border border-white/40 rounded-full hover:bg-white/10"
                >
                  📋 Copy
                </button>
              </div>

              {/* ZOOM */}
              <div className="flex items-center gap-2">
                <button
                  onClick={zoomOut}
                  className="px-3 py-1 border border-white/40 rounded-full hover:bg-white/10"
                >
                  −
                </button>
                <span className="opacity-80 text-xs">
                  {(zoom * 100).toFixed(0)}%
                </span>
                <button
                  onClick={zoomIn}
                  className="px-3 py-1 border border-white/40 rounded-full hover:bg-white/10"
                >
                  +
                </button>
                <button
                  onClick={resetZoom}
                  className="px-3 py-1 border border-white/40 rounded-full hover:bg-white/10"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PINNED MESSAGES MODAL */}
      {pinnedModalOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center"
          onClick={() => setPinnedModalOpen(false)}
        >
          <div
            className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
              <div>
                <h2 className="text-sm font-semibold text-slate-800">
                  Pinned Messages
                </h2>
                <p className="text-[11px] text-slate-500">
                  {pinnedMessages.length === 0
                    ? "No messages pinned yet."
                    : `${pinnedMessages.length} pinned message${
                        pinnedMessages.length > 1 ? "s" : ""
                      }`}
                </p>
              </div>
              <button
                type="button"
                className="text-xs px-2 py-1 rounded-full border border-slate-300 hover:bg-slate-50"
                onClick={() => setPinnedModalOpen(false)}
              >
                Close ✕
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto">
              {pinnedMessages.length === 0 ? (
                <div className="px-4 py-6 text-xs text-slate-500">
                  Pin any message from the conversation to quickly
                  find it here.
                </div>
              ) : (
                pinnedMessages
                  .slice()
                  .sort((a, b) => {
                    const ta = a.updatedAt?.seconds || 0;
                    const tb = b.updatedAt?.seconds || 0;
                    return tb - ta;
                  })
                  .map((m) => {
                    const hasImage =
                      (m.attachments || []).some((att) =>
                        (att.contentType || "").startsWith("image/")
                      );
                    const firstImage = (m.attachments || []).find((att) =>
                      (att.contentType || "").startsWith("image/")
                    );

                    const snippet =
                      m.text ||
                      (hasImage
                        ? "[Image]"
                        : (m.attachments || []).length > 0
                        ? "[Attachment]"
                        : "(No content)");

                    return (
                      <div
                        key={m.id}
                        className="px-4 py-3 border-b border-slate-100 flex items-start gap-3 text-xs"
                      >
                        {hasImage && firstImage ? (
                          <img
                            src={firstImage.url}
                            alt="Pinned preview"
                            className="h-10 w-10 rounded object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded bg-slate-100 flex items-center justify-center flex-shrink-0">
                            <span>📌</span>
                          </div>
                        )}

                        <div className="flex-1">
                          {m.senderName && (
                            <div className="font-semibold text-slate-700 text-[11px] mb-0.5">
                              {m.senderName}
                            </div>
                          )}
                          <div className="text-slate-700 line-clamp-2 mb-1">
                            {snippet}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <button
                              type="button"
                              onClick={() =>
                                scrollToMessage(m.id)
                              }
                              className="px-2 py-0.5 rounded-full border border-slate-300 text-[11px] hover:bg-slate-50"
                            >
                              Jump to message
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                handleTogglePin(m.id, true)
                              }
                              className="px-2 py-0.5 rounded-full border border-red-200 bg-red-50 text-[11px] text-red-600 hover:bg-red-100"
                            >
                              Unpin
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
