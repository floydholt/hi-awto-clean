// src/pages/MessagingCenterAdmin.jsx
import React, { useEffect, useState } from "react";
import InboxPanel from "../components/InboxPanel";
import MessageThreadView from "../components/MessageThreadView";
import { fetchInbox } from "../api/messages";

export default function MessagingCenterAdmin() {
  const [inbox, setInbox] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const data = await fetchInbox();
    setInbox(data);
  }

  return (
    <div className="flex h-full">
      <InboxPanel inbox={inbox} onSelect={setSelected} />
      <MessageThreadView threadId={selected} />
    </div>
  );
}
