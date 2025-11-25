export function getOtherParticipant(thread, currentUserId) {
  if (!thread || !Array.isArray(thread.participants)) return null;
  return thread.participants.find((id) => id !== currentUserId) || null;
}

export function formatTimestamp(ts) {
  if (!ts) return "";
  const date = ts.toDate ? ts.toDate() : ts;
  return date.toLocaleString();
}
