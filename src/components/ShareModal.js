import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import { getFirestore, collection, addDoc, getDocs } from "firebase/firestore";
import { auth } from "../firebaseConfig";
import "../ShareModal.css";

const ShareModal = ({ isOpen, onRequestClose, image }) => {
  const [friends, setFriends] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState("");
  const [selectedOrganization, setSelectedOrganization] = useState("");
  const [message, setMessage] = useState("");
  const firestore = getFirestore();

  useEffect(() => {
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

    const fetchOrganizations = async () => {
      try {
        const querySnapshot = await getDocs(
          collection(firestore, "Organizations")
        );
        const orgList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name,
        }));
        setOrganizations(orgList);
      } catch (error) {
        console.error("Error fetching organizations:", error);
      }
    };

    fetchFriends();
    fetchOrganizations();
  }, [firestore]);

  const handleShareWithFriend = async () => {
    setMessage(""); // Reset message
    if (!selectedFriend) {
      setMessage("Please select a friend to share with.");
      return;
    }

    try {
      if (!image || !image.imageUrl || !image.analysis) {
        throw new Error("Invalid image data. Please try again.");
      }
      await addDoc(collection(firestore, "SharedCards"), {
        sharedBy: auth.currentUser.email,
        sharedWith: selectedFriend,
        imageUrl: image.imageUrl,
        analysis: image.analysis,
      });
      setMessage("Card shared successfully with friend!");
      setSelectedFriend("");
    } catch (error) {
      console.error("Error sharing card with friend:", error);
      setMessage(error.message);
    }
  };

  const handleShareWithOrganization = async () => {
    setMessage(""); // Reset message
    if (!selectedOrganization) {
      setMessage("Please select an organization to share with.");
      return;
    }

    try {
      if (!image || !image.imageUrl || !image.analysis) {
        throw new Error("Invalid image data. Please try again.");
      }
      // Include both organizationId and organizationName for better querying flexibility
      const org = organizations.find((org) => org.id === selectedOrganization);
      await addDoc(collection(firestore, "OrganizationSharedCards"), {
        organizationId: selectedOrganization,
        organizationName: org.name,
        sharedBy: auth.currentUser.email,
        imageUrl: image.imageUrl,
        analysis: image.analysis,
      });
      setMessage("Card shared successfully with organization!");
      setSelectedOrganization("");
    } catch (error) {
      console.error("Error sharing card with organization:", error);
      setMessage(error.message);
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
        <h2>Share Card</h2>
        <div>
          <h3>Share with a Friend</h3>
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
          <button onClick={handleShareWithFriend}>Share with Friend</button>
        </div>

        <div>
          <h3>Share with an Organization</h3>
          <select
            value={selectedOrganization}
            onChange={(e) => setSelectedOrganization(e.target.value)}
          >
            <option value="">Select Organization</option>
            {organizations.map((org) => (
              <option key={org.id} value={org.id}>
                {org.name}
              </option>
            ))}
          </select>
          <button onClick={handleShareWithOrganization}>
            Share with Organization
          </button>
        </div>

        {message && <p>{message}</p>}
      </div>
    </Modal>
  );
};

export default ShareModal;
