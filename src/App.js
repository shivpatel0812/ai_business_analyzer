import React, { useState, useEffect } from "react";
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
import Organizations from "./components/Organizations";
import OrganizationDetails from "./components/OrganizationDetails";
import CreateOrganization from "./components/CreateOrganization";
import OrganizationInvitations from "./components/OrganizationInvitations"; // Import the new component
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
  const navigate = useNavigate();
  const firestore = getFirestore();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsAuthenticated(!!user);
      if (user) {
        fetchUserImages();
        fetchFriends();
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchUserImages = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const querySnapshot = await getDocs(
          collection(firestore, "UserImages")
        );
        const userImages = querySnapshot.docs
          .filter((doc) => doc.data().userId === user.uid)
          .map((doc) => ({ ...doc.data(), id: doc.id }));
        setImages(userImages);
      }
    } catch (error) {
      console.error("Error fetching user images:", error);
    }
  };

  const fetchFriends = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const querySnapshot = await getDocs(collection(firestore, "Friends"));
        const userFriends = querySnapshot.docs
          .filter((doc) => doc.data().user1 === user.email)
          .map((doc) => doc.data().user2);
        setFriends(userFriends);
      }
    } catch (error) {
      console.error("Error fetching friends:", error);
    }
  };

  const openUploadModal = () => setUploadModalOpen(true);
  const closeUploadModal = () => setUploadModalOpen(false);
  const openShareModal = (image) => {
    setSelectedImage(image);
    setShareModalOpen(true);
    console.log("openShareModal called, selectedImage set:", image);
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
  const handleLogout = async () => {
    try {
      await auth.signOut();
      setIsAuthenticated(false);
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <div>
      <header>
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
              <Route path="/shared-cards" element={<SharedCards />} />
              <Route path="/friends" element={<Friends />} />
              <Route path="/organizations" element={<Organizations />} />
              <Route
                path="/organizations/:orgName"
                element={<OrganizationDetails />}
              />
              <Route
                path="/create-organization"
                element={<CreateOrganization />}
              />
              <Route
                path="/organization-invitations"
                element={<OrganizationInvitations />} // New route for invitations
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
            friends={friends}
          />
          <ShareModal
            isOpen={isShareModalOpen}
            onRequestClose={closeShareModal}
            image={selectedImage}
            userId={auth.currentUser ? auth.currentUser.uid : null}
            friends={friends}
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
    <nav
      className={`navbar ${isAuthenticated ? "navbar-small" : "navbar-large"}`}
    >
      <div className="navbar-title">
        <h1>AI Business Card Analyzer</h1>
      </div>
      <ul className="navbar-links">
        <li>
          <Link to="/">Home</Link>
        </li>
        {isAuthenticated && (
          <>
            <li>
              <Link to="/upload">Upload</Link>
            </li>
            <li>
              <Link to="/shared">Datatable</Link>
            </li>
            <li>
              <Link to="/about">About</Link>
            </li>
            <li>
              <Link to="/uploaded-cards">Uploaded Cards</Link>
            </li>
            <li>
              <Link to="/shared-cards">Shared Cards</Link>
            </li>
            <li>
              <Link to="/friends">Friends</Link>
            </li>
            <li>
              <Link to="/organizations">Organizations</Link>
            </li>
            <li>
              <Link to="/organization-invitations">Invitations</Link>
            </li>
            <li>
              <button onClick={onLogout}>Logout</button>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}

export default App;
