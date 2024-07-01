import React, { useState } from "react";
import Modal from "react-modal";
import "../styles.css";

const ShareModal = ({
  isOpen,
  onRequestClose,
  image,
  friends,
  onShareWithFriend,
}) => {
  const [selectedFriend, setSelectedFriend] = useState("");

  const shareExternally = () => {
    const shareData = {
      title: "Shared Card Analysis",
      text: `Check out this analysis: ${image.analysis.summary}`,
      url: image.url,
    };

    try {
      navigator.share(shareData);
    } catch (err) {
      console.error("Error sharing externally:", err);
    }
  };

  const shareWithFriend = () => {
    onShareWithFriend(selectedFriend, image);
    onRequestClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      className="modal"
      overlayClassName="modal-overlay"
    >
      <h2>Share Analysis</h2>
      <button onClick={shareExternally}>Share Externally</button>
      <div>
        <h3>Share with a Friend</h3>
        <select
          value={selectedFriend}
          onChange={(e) => setSelectedFriend(e.target.value)}
        >
          {friends.map((friend) => (
            <option key={friend.id} value={friend.id}>
              {friend.name}
            </option>
          ))}
        </select>
        <button onClick={shareWithFriend}>Share with Friend</button>
      </div>
    </Modal>
  );
};

export default ShareModal;
