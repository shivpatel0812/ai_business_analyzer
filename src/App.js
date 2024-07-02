import React, { useState, useEffect } from "react";
import axios from "axios";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import Home from "./components/Home";
import Register from "./components/Register";
import ConfirmSignUp from "./components/ConfirmSignup";
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
import { Auth } from "aws-amplify";

function App() {
  const [isUploadModalOpen, setUploadModalOpen] = useState(false);
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isImageModalOpen, setImageModalOpen] = useState(false);
  const [isChatBoxOpen, setChatBoxOpen] = useState(false);
  const [isShareModalOpen, setShareModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [friends, setFriends] = useState([]);
  const [sharedCards, setSharedCards] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const user = await Auth.currentAuthenticatedUser();
        console.log("Authenticated user in checkAuthStatus:", user);
        setIsAuthenticated(true);
      } catch (error) {
        console.log("User not authenticated in checkAuthStatus:", error);
        setIsAuthenticated(false);
      } finally {
        setIsAuthChecked(true);
      }
    };

    checkAuthStatus();
  }, []);

  useEffect(() => {
    if (
      isAuthChecked &&
      !isAuthenticated &&
      window.location.pathname !== "/login"
    ) {
      navigate("/login");
    }
  }, [isAuthChecked, isAuthenticated, navigate]);

  const handleLoginSuccess = () => {
    console.log("Login success handler called");
    setIsAuthenticated(true);
    setIsAuthChecked(true);
    navigate("/upload"); // Redirect to upload page after successful login
  };

  const fetchUserId = async () => {
    try {
      const user = await Auth.currentAuthenticatedUser();
      console.log("User authenticated in fetchUserId:", user);
      return user.attributes.sub;
    } catch (error) {
      console.error("Error fetching user ID:", error.message);
      throw new Error("User not authenticated");
    }
  };

  const fetchUserImages = async (userId) => {
    try {
      const response = await axios.get(
        "https://996eyi0mva.execute-api.us-east-2.amazonaws.com/dev-stage",
        { params: { userId } }
      );
      console.log("Images fetched successfully:", response.data);
      setImages(response.data);
    } catch (error) {
      console.error("Error fetching user images:", error);
    }
  };

  useEffect(() => {
    const fetchImages = async () => {
      if (isAuthenticated) {
        try {
          const userId = await fetchUserId();
          await fetchUserImages(userId);
        } catch (error) {
          console.error(error);
        }
      }
    };

    fetchImages();
  }, [isAuthenticated]);

  const openUploadModal = () => {
    setUploadModalOpen(true);
  };

  const closeUploadModal = () => {
    setUploadModalOpen(false);
  };

  const openShareModal = (image) => {
    setSelectedImage(image);
    setShareModalOpen(true);
  };

  const closeShareModal = () => {
    setShareModalOpen(false);
    setSelectedImage(null);
  };

  const addImage = (newImage) => {
    setImages([newImage, ...images]);
  };

  const openImageModal = (image) => {
    setSelectedImage(image);
    setImageModalOpen(true);
  };

  const closeImageModal = () => {
    setImageModalOpen(false);
    setSelectedImage(null);
  };

  const openChatBox = () => {
    setChatBoxOpen(true);
  };

  const closeChatBox = () => {
    setChatBoxOpen(false);
  };

  const shareWithFriend = async (friendId, image) => {
    setSharedCards([...sharedCards, { ...image, sharedBy: friendId }]);
  };

  const sendFriendRequest = async (friendName) => {
    console.log(`Sending friend request to ${friendName}`);
  };

  const acceptFriendRequest = async (requestId) => {
    console.log(`Accepting friend request with ID: ${requestId}`);
  };

  if (!isAuthChecked) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <header>
        <h1>AI Business Card Analyzer</h1>
        <NavBar isAuthenticated={isAuthenticated} />
      </header>
      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/login"
            element={<Login setIsAuthenticated={handleLoginSuccess} />}
          />
          <Route path="/register" element={<Register />} />
          <Route
            path="/confirm-sign-up"
            element={<ConfirmSignUp setIsAuthenticated={handleLoginSuccess} />}
          />
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

function NavBar({ isAuthenticated }) {
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
        </>
      )}
    </nav>
  );
}

export default App;
