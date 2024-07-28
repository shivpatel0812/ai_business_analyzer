import React, { useState, useEffect } from "react";
import axios from "axios";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import Home from "./components/Home";
import Register from "./components/Register";
import Login from "./components/Login";
import About from "./components/About";
import Shared from "./components/Shared";
import Upload from "./components/Upload";
import S3ImageDisplay from "./components/S3ImageDisplay";
import AnalysisModal from "./components/AnalysisModal";
import ChatBox from "./components/ChatBox";
import ShareModal from "./components/ShareModal";
import SharedCards from "./components/SharedCards";
import Friends from "./components/Friends";
import "./App.css";
import { auth } from "./firebaseConfig";
import { collection, getDocs, getFirestore } from "firebase/firestore";

function App() {
  const [isUploadModalOpen, setUploadModalOpen] = useState(false);
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isImageModalOpen, setImageModalOpen] = useState(false);
  const [isChatBoxOpen, setChatBoxOpen] = useState(false);
  const [isShareModalOpen, setShareModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [friends, setFriends] = useState([]);
  const [sharedCards, setSharedCards] = useState([]);
  const navigate = useNavigate();
  const firestore = getFirestore();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsAuthenticated(!!user);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserImages();
    }
  }, [isAuthenticated]);

  const fetchUserImages = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const userId = user.uid;
        const querySnapshot = await getDocs(
          collection(firestore, "UserImages")
        );
        const userImages = querySnapshot.docs
          .filter((doc) => doc.data().userId === userId)
          .map((doc) => doc.data());
        setImages(userImages);
      }
    } catch (error) {
      console.error("Error fetching user images:", error);
    }
  };

  const openUploadModal = () => setUploadModalOpen(true);
  const closeUploadModal = () => setUploadModalOpen(false);
  const openShareModal = (image) => {
    setSelectedImage(image);
    setShareModalOpen(true);
  };
  const closeShareModal = () => {
    setShareModalOpen(false);
    setSelectedImage(null);
  };
  const addImage = (newImage) => setImages([newImage, ...images]);
  const openImageModal = (image) => {
    setSelectedImage(image);
    setImageModalOpen(true);
  };
  const closeImageModal = () => {
    setImageModalOpen(false);
    setSelectedImage(null);
  };
  const openChatBox = () => setChatBoxOpen(true);
  const closeChatBox = () => setChatBoxOpen(false);
  const shareWithFriend = (friendId, image) => {
    setSharedCards([...sharedCards, { ...image, sharedBy: friendId }]);
  };
  const sendFriendRequest = (friendName) => {
    console.log(`Sending friend request to ${friendName}`);
  };
  const acceptFriendRequest = (requestId) => {
    console.log(`Accepting friend request with ID: ${requestId}`);
  };
  const handleLogout = async () => {
    try {
      await auth.signOut();
      setIsAuthenticated(false);
      navigate("/login"); // Redirect to login page after logging out
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <div>
      <header>
        <h1>AI Business Card Analyzer</h1>
        <NavBar isAuthenticated={isAuthenticated} onLogout={handleLogout} />
      </header>
      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/login"
            element={<Login setIsAuthenticated={setIsAuthenticated} />}
          />
          <Route path="/register" element={<Register />} />
          {isAuthenticated && (
            <>
              <Route
                path="/shared"
                element={
                  <Shared images={images} setSelectedImage={setSelectedImage} />
                }
              />
              <Route path="/about" element={<About />} />
              <Route
                path="/uploaded-cards"
                element={
                  <S3ImageDisplay
                    images={images}
                    openImageModal={openImageModal}
                  />
                }
              />
              <Route
                path="/upload"
                element={
                  <Upload
                    isOpen={isUploadModalOpen}
                    onRequestClose={closeUploadModal}
                    addImage={addImage}
                    openShareModal={openShareModal}
                    fetchUserImages={fetchUserImages}
                  />
                }
              />
              <Route
                path="/shared-cards"
                element={<SharedCards sharedCards={sharedCards} />}
              />
              <Route
                path="/friends"
                element={
                  <Friends
                    friends={friends}
                    onSendRequest={sendFriendRequest}
                    onAcceptRequest={acceptFriendRequest}
                  />
                }
              />
            </>
          )}
        </Routes>
      </main>
      {selectedImage && (
        <>
          <AnalysisModal
            isOpen={isImageModalOpen}
            onRequestClose={closeImageModal}
            image={selectedImage}
          />
          <ShareModal
            isOpen={isShareModalOpen}
            onRequestClose={closeShareModal}
            image={selectedImage}
            friends={friends}
            onShareWithFriend={shareWithFriend}
          />
          <ChatBox
            isOpen={isChatBoxOpen}
            onRequestClose={closeChatBox}
            cardId={selectedImage.id}
          />
        </>
      )}
    </div>
  );
}

function NavBar({ isAuthenticated, onLogout }) {
  return (
    <nav className="navbar">
      <Link to="/">Home</Link>
      {isAuthenticated && (
        <>
          <Link to="/upload">Upload</Link>
          <Link to="/shared">Shared</Link>
          <Link to="/about">About</Link>
          <Link to="/uploaded-cards">Uploaded Cards</Link>
          <Link to="/shared-cards">Shared Cards</Link>
          <Link to="/friends">Friends</Link>
          <button onClick={onLogout}>Logout</button>
        </>
      )}
    </nav>
  );
}

export default App;
