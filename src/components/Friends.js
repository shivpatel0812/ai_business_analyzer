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
  updateDoc,
  setDoc, // Add this import for Firestore set operation
} from "firebase/firestore";
import { getAuth, updateProfile } from "firebase/auth"; // Import for updating Firebase profile
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"; // Import for Firebase Storage
import "../Friends.css";
import "../Profile.css";
import "react-toastify/dist/ReactToastify.css";
import Modal from "react-modal";
import { onSnapshot } from "firebase/firestore";

const Friends = () => {
  const [friendRequests, setFriendRequests] = useState([]);
  const [friendEmail, setFriendEmail] = useState("");
  const [friends, setFriends] = useState([]);
  const [userProfile, setUserProfile] = useState({
    username: "",
    profilePicture: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const firestore = getFirestore();
  const auth = getAuth();

  useEffect(() => {
    if (auth.currentUser) {
      saveUserProfileOnAuth(); // Ensure the profile is saved
      fetchFriendRequests();
      fetchFriends();
      fetchUserProfile(); // Fetch the user's profile info
    }
  }, [auth]);

  const fetchUserProfile = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const docRef = doc(firestore, "Users", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setUserProfile(docSnap.data());
      } else {
        console.error("No such document!");
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };
  const testQuery = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const userQuery = query(
        collection(firestore, "Friends"),
        where("user1", "==", user.email) // or `user.uid` if you are using UIDs
      );

      const friendSnapshot = await getDocs(userQuery);
      console.log("Friend documents retrieved:", friendSnapshot.docs.length);
      friendSnapshot.docs.forEach((doc) =>
        console.log(doc.id, "=>", doc.data())
      );
    } catch (error) {
      console.error("Error fetching friends:", error);
    }
  };
  useEffect(() => {
    if (auth.currentUser) {
      saveUserProfileOnAuth(); // Ensure the profile is saved
      fetchFriendRequests();
      fetchFriends();
      fetchUserProfile(); // Fetch the user's profile info
      testQuery(); // Call the test query to log friend documents
    }
  }, [auth]);

  const saveUserProfileOnAuth = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const docRef = doc(firestore, "Users", user.uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        await setDoc(docRef, {
          username: user.displayName || "",
          profilePicture: user.photoURL || "",
        });
        console.log("User profile created!");
      }
    } catch (error) {
      console.error("Error creating user profile:", error);
    }
  };

  const saveUserProfile = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const docRef = doc(firestore, "Users", user.uid);
      await updateDoc(docRef, userProfile); // Update Firestore profile
      await updateProfile(user, {
        displayName: userProfile.username,
        photoURL: userProfile.profilePicture,
      }); // Update Firebase Auth profile

      setIsEditing(false);
      toast.success("Profile updated successfully.");
    } catch (error) {
      console.error("Error saving user profile:", error);
      toast.error("Error saving profile.");
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setUserProfile((prevProfile) => ({
      ...prevProfile,
      [name]: value,
    }));
  };

  const storage = getStorage();

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const user = auth.currentUser;
    if (!user) return;

    const storageRef = ref(storage, `profilePictures/${user.uid}`);

    // Upload the file to Firebase Storage
    uploadBytes(storageRef, file)
      .then((snapshot) => {
        // Get the download URL for the uploaded image
        return getDownloadURL(snapshot.ref);
      })
      .then((downloadURL) => {
        // Save the download URL to the user profile
        setUserProfile((prevProfile) => ({
          ...prevProfile,
          profilePicture: downloadURL,
        }));

        // Also save it to Firestore
        const docRef = doc(firestore, "Users", user.uid);
        updateDoc(docRef, { profilePicture: downloadURL });
      })
      .then(() => {
        toast.success("Profile picture updated successfully.");
      })
      .catch((error) => {
        console.error("Error uploading profile picture:", error);
        toast.error("Error uploading profile picture.");
      });
  };

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
        where("user1", "==", user.email) // Query based on the current user's email
      );

      const friendSnapshot = await getDocs(userQuery);
      console.log("Friend documents retrieved:", friendSnapshot.docs.length);

      const userFriends = await Promise.all(
        friendSnapshot.docs.map(async (friendDoc) => {
          const friendUid = friendDoc.data().user2; // Assuming user2 contains the UID

          try {
            // Fetch the user profile by UID from the "Users" collection
            const userDoc = await getDoc(doc(firestore, "Users", friendUid));

            if (userDoc.exists()) {
              const { username, profilePicture } = userDoc.data();
              return {
                id: friendDoc.id,
                uid: friendUid,
                username: username || "Unknown",
                profilePicture: profilePicture || "default-profile-pic-url",
              };
            } else {
              console.error(`No profile found for UID: ${friendUid}`);
              return {
                id: friendDoc.id,
                uid: friendUid,
                username: "Unknown",
                profilePicture: "default-profile-pic-url",
              };
            }
          } catch (error) {
            console.error(
              `Error fetching profile for UID: ${friendUid}`,
              error
            );
            return {
              id: friendDoc.id,
              uid: friendUid,
              username: "Unknown",
              profilePicture: "default-profile-pic-url",
            };
          }
        })
      );

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

        // Add friend entries for both users
        batch.set(doc(collection(firestore, "Friends")), {
          user1: sender,
          user2: receiver,
        });
        batch.set(doc(collection(firestore, "Friends")), {
          user1: receiver,
          user2: sender,
        });

        // Delete the friend request
        batch.delete(doc(firestore, "FriendRequests", requestId));
        await batch.commit();

        // Re-fetch friend requests and friends
        fetchFriendRequests();
        fetchFriends();

        toast.success("Friend request accepted.");
      }
    } catch (error) {
      console.error("Error accepting friend request:", error);
      toast.error("Error accepting friend request.");
    }
  };

  const handleRemoveFriend = async () => {
    if (!selectedFriend) return;

    const user = auth.currentUser;
    if (!user) return;

    try {
      const userFriendDoc = doc(firestore, "Friends", selectedFriend.id);
      const friendUserQuery = query(
        collection(firestore, "Friends"),
        where("user1", "==", selectedFriend.email),
        where("user2", "==", user.email)
      );

      const friendUserSnapshot = await getDocs(friendUserQuery);
      const batch = writeBatch(firestore);

      batch.delete(userFriendDoc);
      friendUserSnapshot.docs.forEach((doc) => batch.delete(doc.ref));

      await batch.commit();

      setFriends(friends.filter((friend) => friend.id !== selectedFriend.id));
      setModalIsOpen(false);
      toast.success("Friend removed successfully.");
    } catch (error) {
      console.error("Error removing friend:", error);
      toast.error("Error removing friend.");
    }
  };

  const openModal = (friend) => {
    setSelectedFriend(friend);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedFriend(null);
  };
  const listenForFriendRequests = () => {
    const user = auth.currentUser;
    if (!user) return;

    const requestsQuery = query(
      collection(firestore, "FriendRequests"),
      where("receiver", "==", user.email)
    );

    return onSnapshot(requestsQuery, (snapshot) => {
      const requests = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setFriendRequests(requests);
    });
  };

  // Real-time listener for friends
  const listenForFriends = () => {
    const user = auth.currentUser;
    if (!user) return;

    const friendsQuery = query(
      collection(firestore, "Friends"),
      where("user1", "==", user.email)
    );

    return onSnapshot(friendsQuery, (snapshot) => {
      const userFriends = snapshot.docs.map((doc) => ({
        id: doc.id,
        email: doc.data().user2,
      }));
      setFriends(userFriends);
    });
  };

  useEffect(() => {
    if (auth.currentUser) {
      const unsubscribeFriendRequests = listenForFriendRequests();
      const unsubscribeFriends = listenForFriends();

      // Cleanup listeners when component unmounts
      return () => {
        unsubscribeFriendRequests();
        unsubscribeFriends();
      };
    }
  }, [auth]);

  return (
    <div className="friends-profile-container">
      {userProfile && (
        <div className="profile-container">
          <div className="profile-pic-container">
            <img
              src={userProfile.profilePicture || "default-profile-pic-url"}
              alt="Profile"
              className="profile-pic"
            />
          </div>
          {isEditing ? (
            <>
              <input
                type="text"
                name="username"
                value={userProfile.username}
                onChange={handleProfileChange}
                placeholder="Enter your username"
                className="username-input"
              />
              <input
                type="file"
                accept="image/*"
                onChange={handleProfilePicChange}
                className="profile-pic-input"
              />
              <button onClick={saveUserProfile} className="save-profile-button">
                Save Profile
              </button>
            </>
          ) : (
            <>
              <p className="profile-username">{userProfile.username}</p>
              <button
                onClick={() => setIsEditing(true)}
                className="profile-edit-button"
              >
                Edit Profile
              </button>
            </>
          )}
        </div>
      )}
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
                <img
                  src={
                    friend.profilePicture || "path/to/default-profile-pic.jpg"
                  }
                  alt="Friend Profile"
                  className="friend-profile-pic"
                />
                <p className="friend-username">
                  {friend.username || "Unknown"}
                </p>
              </div>
            ))
          ) : (
            <p>You have no friends yet</p>
          )}
        </div>
      </div>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Friend Details"
        className="modal"
        overlayClassName="modal-overlay"
      >
        <h2>Friend Details</h2>
        {selectedFriend && <p>{selectedFriend.email}</p>}
        <button onClick={handleRemoveFriend} className="remove-button">
          Remove Friend
        </button>
        <button onClick={closeModal} className="cancel-button">
          Cancel
        </button>
      </Modal>
    </div>
  );
};

export default Friends;
