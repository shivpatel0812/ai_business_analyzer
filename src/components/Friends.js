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
      const userFriends = friendSnapshot.docs.map((doc) => doc.data().user2);

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

  return (
    <div className="friends-container">
      <ToastContainer />
      <h1>Friends</h1>
      <div>
        <h2>Send Friend Request</h2>
        <input
          type="email"
          value={friendEmail}
          onChange={(e) => setFriendEmail(e.target.value)}
          placeholder="Enter friend's email"
        />
        <button onClick={handleSendRequest}>Send Request</button>
      </div>
      <div>
        <h2>Friend Requests</h2>
        {friendRequests.map((request) => (
          <div key={request.id} className="friend-request">
            <p>{request.sender}</p>
            <button onClick={() => handleAcceptRequest(request.id)}>
              Accept
            </button>
          </div>
        ))}
      </div>
      <div>
        <h2>Your Friends</h2>
        {friends.map((friend, index) => (
          <div key={index} className="friend-item">
            <p>{friend}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Friends;
