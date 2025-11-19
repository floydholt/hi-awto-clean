// client/src/pages/ViewThread.jsx
import React from "react";
import { useParams } from "react-router-dom";
import MessageThreadView from "../components/MessageThreadView";

export default function ViewThread() {
  const { threadId } = useParams();

  return (
    <div className="p-4 h-[calc(100vh-80px)]">
      <MessageThreadView threadId={threadId} />
    </div>
  );
}
