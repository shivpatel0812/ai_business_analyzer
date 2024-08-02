import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import { getFirestore, collection, addDoc, getDocs } from "firebase/firestore";
import { auth } from "../firebaseConfig";
import "../InviteModal.css";

const InviteModal = ({ isOpen, onRequestClose, organizationName, orgId }) => {
  const [friends, setFriends] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [message, setMessage] = useState("");
  const firestore = getFirestore();

  useEffect(() => {
    console.log("Organization Name in InviteModal:", organizationName);
    const fetchFriends = async () => {
      try {
        const querySnapshot = await getDocs(collection(firestore, "Friends"));
        const friendsList = querySnapshot.docs.map((doc) => {
          const friendData = doc.data();
          return friendData.user1 === auth.currentUser.email
            ? friendData.user2
            : friendData.user1;
        });
        setFriends(friendsList);
      } catch (error) {
        console.error("Error fetching friends:", error);
      }
    };

    fetchFriends();
  }, [firestore, organizationName]);

  const handleInviteFriend = async () => {
    setMessage(""); // Reset message
    if (!selectedFriend) {
      setMessage("Please select a friend to invite.");
      return;
    }
    if (!organizationName) {
      setMessage("Organization name is not defined.");
      return;
    }

    try {
      await addDoc(collection(firestore, "OrganizationInvitations"), {
        organizationName: organizationName,
        organizationId: orgId, // Ensure the orgId is provided
        invitedBy: auth.currentUser.email,
        invitedUser: selectedFriend,
      });
      setMessage("Friend invited successfully!");
      setSelectedFriend("");
    } catch (error) {
      console.error("Error inviting friend:", error);
      setMessage(`Error inviting friend: ${error.message}`);
    }
  };

  const handleInviteNewUser = async () => {
    setMessage(""); // Reset message
    if (!newUserEmail) {
      setMessage("Please enter the new user's email.");
      return;
    }
    if (!organizationName) {
      setMessage("Organization name is not defined.");
      return;
    }

    try {
      await addDoc(collection(firestore, "OrganizationInvitations"), {
        organizationName: organizationName,
        organizationId: orgId, // Ensure the orgId is provided
        invitedBy: auth.currentUser.email,
        invitedUser: newUserEmail,
      });
      setMessage("New user invited successfully!");
      setNewUserEmail("");
    } catch (error) {
      console.error("Error inviting new user:", error);
      setMessage(`Error inviting new user: ${error.message}`);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      className="modal"
      overlayClassName="modal-overlay"
    >
      <div className="modal-content">
        <button onClick={onRequestClose} className="modal-close">
          &times;
        </button>
        <h2>Invite to {organizationName || "Organization"}</h2>
        <div>
          <h3>Invite a Friend</h3>
          <select
            value={selectedFriend}
            onChange={(e) => setSelectedFriend(e.target.value)}
          >
            <option value="">Select Friend</option>
            {friends.map((friend, index) => (
              <option key={index} value={friend}>
                {friend}
              </option>
            ))}
          </select>
          <button onClick={handleInviteFriend}>Invite Friend</button>
        </div>
        <div>
          <h3>Invite a New User</h3>
          <input
            type="email"
            value={newUserEmail}
            onChange={(e) => setNewUserEmail(e.target.value)}
            placeholder="Enter user's email"
          />
          <button onClick={handleInviteNewUser}>Invite New User</button>
        </div>
        {message && <p>{message}</p>}
      </div>
    </Modal>
  );
};

export default InviteModal;
