import React from 'react';

function MessageGroup({ listingLabel, messages, formatTimestamp, handleReply }) {
  return (
    <div className="message-group">
      <h4>Listing: {listingLabel}</h4>
      <ul className="message-list">
        {messages.map((msg) => (
          <li key={msg.id}>
            <strong>{msg.senderName}</strong> ({msg.senderEmail})<br />
            <em>{msg.message}</em><br />
            <span className="timestamp">{formatTimestamp(msg.timestamp)}</span>
            {!msg.read && <span className="unread-badge">🔵 Unread</span>}
            <button onClick={() => handleReply(msg)}>Reply</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default MessageGroup;
