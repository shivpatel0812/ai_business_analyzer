import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import "../Friends.css";

const Friends = ({ friends, onSendRequest, onAcceptRequest }) => {
  const [friendRequests, setFriendRequests] = useState([]);
  const [friendName, setFriendName] = useState("");

  const handleSendRequest = () => {
    onSendRequest(friendName);
    setFriendName("");
  };

  useEffect(() => {
    // Fetch friend requests from server
    const fetchFriendRequests = async () => {
      // Implement fetching friend requests logic
      setFriendRequests([
        { id: 1, name: "John Doe" },
        { id: 2, name: "Jane Smith" },
      ]);
    };

    fetchFriendRequests();
  }, []);

  return (
    <div className="friends-container">
      <h1>Friends</h1>
      <div>
        <h2>Send Friend Request</h2>
        <input
          type="text"
          value={friendName}
          onChange={(e) => setFriendName(e.target.value)}
          placeholder="Enter friend's name"
        />
        <button onClick={handleSendRequest}>Send Request</button>
      </div>
      <div>
        <h2>Friend Requests</h2>
        {friendRequests.map((request) => (
          <div key={request.id} className="friend-request">
            <p>{request.name}</p>
            <button onClick={() => onAcceptRequest(request.id)}>Accept</button>
          </div>
        ))}
      </div>
      <div>
        <h2>Your Friends</h2>
        {friends.map((friend) => (
          <div key={friend.id} className="friend-item">
            <p>{friend.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Friends;
