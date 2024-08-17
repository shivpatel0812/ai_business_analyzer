import React, { useState } from "react";
import { getFirestore, doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebaseConfig";
import { auth } from "../firebaseConfig";
import "../Profile.css";

const Profile = () => {
  const [username, setUsername] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);
  const firestore = getFirestore();
  const user = auth.currentUser;

  const handleUpdateProfile = async () => {
    if (!user) return;
    const userRef = doc(firestore, "Users", user.uid);
    const updates = {};

    if (username) {
      updates.username = username;
    }

    if (profilePicture) {
      const profilePicRef = ref(storage, `profilePictures/${user.uid}`);
      await uploadBytes(profilePicRef, profilePicture);
      const profilePicUrl = await getDownloadURL(profilePicRef);
      updates.profilePicture = profilePicUrl;
    }

    await updateDoc(userRef, updates);
  };

  return (
    <div className="profile-container">
      <h2>Update Profile</h2>
      <input
        type="text"
        placeholder="New Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="file"
        onChange={(e) => setProfilePicture(e.target.files[0])}
      />
      <button onClick={handleUpdateProfile}>Update Profile</button>
    </div>
  );
};

export default Profile;
