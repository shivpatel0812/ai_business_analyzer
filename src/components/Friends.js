import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  deleteDoc,
  getDoc,
  writeBatch,
  query,
  where,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import "../Friends.css";
import "react-toastify/dist/ReactToastify.css";

const Friends = () => {
  const [friendRequests, setFriendRequests] = useState([]);
  const [friendEmail, setFriendEmail] = useState("");
  const [friends, setFriends] = useState([]);
  const firestore = getFirestore();
  const auth = getAuth();

  useEffect(() => {
    if (auth.currentUser) {
      fetchFriendRequests();
      fetchFriends();
    }
  }, [auth]);

  const fetchFriendRequests = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const querySnapshot = await getDocs(
        collection(firestore, "FriendRequests")
      );
      const requests = querySnapshot.docs
        .filter((doc) => doc.data().receiver === user.email)
        .map((doc) => ({ id: doc.id, ...doc.data() }));
      setFriendRequests(requests);
    } catch (error) {
      console.error("Error fetching friend requests:", error);
    }
  };

  const fetchFriends = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const userQuery = query(
        collection(firestore, "Friends"),
        where("user1", "==", user.email)
      );

      const friendSnapshot = await getDocs(userQuery);
      const userFriends = friendSnapshot.docs.map((doc) => ({
        id: doc.id,
        email: doc.data().user2,
      }));

      setFriends(userFriends);
    } catch (error) {
      console.error("Error fetching friends:", error);
    }
  };

  const handleSendRequest = async () => {
    const user = auth.currentUser;
    if (!user) {
      toast.error("You must be authenticated to send friend requests.");
      return;
    }

    if (friendEmail === user.email) {
      toast.error("You cannot send a friend request to yourself.");
      return;
    }

    try {
      const querySnapshot = await getDocs(
        collection(firestore, "FriendRequests")
      );
      const existingRequest = querySnapshot.docs.find(
        (doc) =>
          doc.data().sender === user.email &&
          doc.data().receiver === friendEmail
      );

      if (existingRequest) {
        toast.info("Friend request already sent.");
        return;
      }

      await addDoc(collection(firestore, "FriendRequests"), {
        sender: user.email,
        receiver: friendEmail,
      });
      toast.success("Friend request sent.");
      setFriendEmail("");
    } catch (error) {
      console.error("Error sending friend request:", error);
      toast.error("Error sending friend request.");
    }
  };

  const handleAcceptRequest = async (requestId) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const requestDoc = await getDoc(
        doc(firestore, "FriendRequests", requestId)
      );
      if (requestDoc.exists()) {
        const { sender, receiver } = requestDoc.data();
        const batch = writeBatch(firestore);
        batch.delete(doc(firestore, "FriendRequests", requestId));
        batch.set(doc(collection(firestore, "Friends")), {
          user1: sender,
          user2: receiver,
        });
        batch.set(doc(collection(firestore, "Friends")), {
          user1: receiver,
          user2: sender,
        });
        await batch.commit();
        fetchFriendRequests();
        fetchFriends();
        toast.success("Friend request accepted.");
      }
    } catch (error) {
      console.error("Error accepting friend request:", error);
      toast.error("Error accepting friend request.");
    }
  };

  const handleRemoveFriend = async (friendId) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      // Delete both relationships in the Friends collection
      const userFriendDoc = doc(firestore, "Friends", friendId);
      const friendUserQuery = query(
        collection(firestore, "Friends"),
        where("user1", "==", friends.find((f) => f.id === friendId).email),
        where("user2", "==", user.email)
      );

      const friendUserSnapshot = await getDocs(friendUserQuery);
      const batch = writeBatch(firestore);

      batch.delete(userFriendDoc);
      friendUserSnapshot.docs.forEach((doc) => batch.delete(doc.ref));

      await batch.commit();

      // Update local state
      setFriends(friends.filter((friend) => friend.id !== friendId));
      toast.success("Friend removed successfully.");
    } catch (error) {
      console.error("Error removing friend:", error);
      toast.error("Error removing friend.");
    }
  };

  return (
    <div className="friends-container">
      <ToastContainer />
      <div className="friends-header">
        <h1>Friends</h1>
        <input
          type="email"
          value={friendEmail}
          onChange={(e) => setFriendEmail(e.target.value)}
          placeholder="Enter friend's email"
          className="friends-input"
        />
        <button onClick={handleSendRequest} className="send-request-button">
          Send Request
        </button>
      </div>
      <div className="friend-requests">
        <h2>Friend Requests</h2>
        {friendRequests.length > 0 ? (
          friendRequests.map((request) => (
            <div key={request.id} className="friend-request">
              <p>{request.sender}</p>
              <button
                onClick={() => handleAcceptRequest(request.id)}
                className="accept-button"
              >
                Accept
              </button>
            </div>
          ))
        ) : (
          <p>No friend requests</p>
        )}
      </div>
      <div className="your-friends">
        <h2>Your Friends</h2>
        {friends.length > 0 ? (
          friends.map((friend) => (
            <div key={friend.id} className="friend-item">
              <p>{friend.email}</p>
              <button
                onClick={() => handleRemoveFriend(friend.id)}
                className="remove-button"
              >
                Remove
              </button>
            </div>
          ))
        ) : (
          <p>You have no friends yet</p>
        )}
      </div>
    </div>
  );
};

export default Friends;
