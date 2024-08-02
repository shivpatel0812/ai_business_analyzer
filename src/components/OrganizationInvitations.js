import React, { useState, useEffect } from "react";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  where,
} from "firebase/firestore";
import { auth } from "../firebaseConfig";
import "../OrganizationInvitations.css"; // Add CSS for styling

const OrganizationInvitations = () => {
  const [invitations, setInvitations] = useState([]);
  const [message, setMessage] = useState("");
  const firestore = getFirestore();

  useEffect(() => {
    const fetchInvitations = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const querySnapshot = await getDocs(
          collection(firestore, "OrganizationInvitations")
        );
        const userInvitations = querySnapshot.docs.filter((doc) => {
          const data = doc.data();
          return data.invitedUser === user.email;
        });

        const invitationsData = userInvitations.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setInvitations(invitationsData);
        console.log("Fetched invitations:", invitationsData);
      } catch (error) {
        console.error("Error fetching invitations:", error);
      }
    };

    fetchInvitations();
  }, [firestore]);

  const handleAccept = async (invitation) => {
    try {
      console.log("Handling accept for invitation:", invitation);

      // Assume organizationName is unique and can fetch org document with it
      const orgQuerySnapshot = await getDocs(
        collection(firestore, "Organizations"),
        where("name", "==", invitation.organizationName)
      );

      if (orgQuerySnapshot.empty) {
        throw new Error("Organization not found.");
      }

      const orgDoc = orgQuerySnapshot.docs[0];
      const orgData = orgDoc.data();
      const members = orgData.members || [];

      // Add the current user's email to the members array if not already present
      if (!members.includes(auth.currentUser.email)) {
        members.push(auth.currentUser.email);
        await updateDoc(orgDoc.ref, { members });
      }

      // Remove the invitation after accepting
      await deleteDoc(doc(firestore, "OrganizationInvitations", invitation.id));

      // Update the UI
      setMessage("Invitation accepted!");
      setInvitations(invitations.filter((inv) => inv.id !== invitation.id));
    } catch (error) {
      console.error("Error accepting invitation:", error);
      setMessage(`Error accepting invitation: ${error.message}`);
    }
  };

  const handleReject = async (invitation) => {
    try {
      await deleteDoc(doc(firestore, "OrganizationInvitations", invitation.id));
      setMessage("Invitation rejected.");
      setInvitations(invitations.filter((inv) => inv.id !== invitation.id));
    } catch (error) {
      console.error("Error rejecting invitation:", error);
      setMessage(`Error rejecting invitation: ${error.message}`);
    }
  };

  return (
    <div className="invitations-container">
      <h2>Organization Invitations</h2>
      {message && <p>{message}</p>}
      {invitations.length > 0 ? (
        invitations.map((invitation) => (
          <div key={invitation.id} className="invitation-card">
            <p>
              <strong>Organization:</strong> {invitation.organizationName}
            </p>
            <p>
              <strong>Invited By:</strong> {invitation.invitedBy}
            </p>
            <button onClick={() => handleAccept(invitation)}>Accept</button>
            <button onClick={() => handleReject(invitation)}>Reject</button>
          </div>
        ))
      ) : (
        <p>No invitations available.</p>
      )}
    </div>
  );
};

export default OrganizationInvitations;
