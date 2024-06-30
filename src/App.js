import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router-dom";
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
import "./App.css";
import { Auth } from "aws-amplify";

function App() {
  const [isUploadModalOpen, setUploadModalOpen] = useState(false);
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isImageModalOpen, setImageModalOpen] = useState(false);
  const [isChatBoxOpen, setChatBoxOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const fetchUserId = async () => {
    try {
      const user = await Auth.currentAuthenticatedUser();
      return user.attributes.sub;
    } catch (error) {
      console.error("Error fetching user ID:", error);
      throw new Error("User not authenticated");
    }
  };

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const user = await Auth.currentAuthenticatedUser();
        setIsAuthenticated(true);
      } catch {
        setIsAuthenticated(false);
      }
    };

    checkAuthStatus();
  }, []);

  useEffect(() => {
    const fetchUserImages = async () => {
      if (!isAuthenticated) return;

      try {
        const userId = await fetchUserId();
        const response = await axios.get(
          "https://996eyi0mva.execute-api.us-east-2.amazonaws.com/dev-stage",
          {
            params: { userId },
          }
        );
        setImages(response.data);
      } catch (error) {
        console.error("Error fetching user images:", error);
      }
    };

    fetchUserImages();
  }, [isAuthenticated]);

  const openUploadModal = () => {
    setUploadModalOpen(true);
  };

  const closeUploadModal = () => {
    setUploadModalOpen(false);
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

  return (
    <Router>
      <div>
        <header>
          <h1>AI Business Card Analyzer</h1>
          <NavBar />
        </header>
        <main className="container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/confirm-sign-up" element={<ConfirmSignUp />} />
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
                />
              }
            />
          </Routes>
        </main>
        {selectedImage && (
          <>
            <AnalysisModal
              isOpen={isImageModalOpen}
              onRequestClose={closeImageModal}
              image={selectedImage}
            />
            <ChatBox
              isOpen={isChatBoxOpen}
              onRequestClose={closeChatBox}
              cardId={selectedImage.id}
            />
          </>
        )}
      </div>
    </Router>
  );
}

function NavBar() {
  const location = useLocation();
  if (location.pathname === "/") return null;

  return (
    <nav className="navbar">
      <Link to="/">Home</Link>
      <Link to="/upload">Upload</Link>
      <Link to="/shared">Shared</Link>
      <Link to="/about">About</Link>
      <Link to="/uploaded-cards">Uploaded Cards</Link>
    </nav>
  );
}

export default App;
