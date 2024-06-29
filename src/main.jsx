import React, { useState } from "react";
import axios from "axios";

function ImageUploadPrompt() {
  const [file, setFile] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handlePromptChange = (e) => {
    setPrompt(e.target.value);
  };

  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("prompt", prompt);

    try {
      const res = await axios.post("http://localhost:5000/analyze", formData);
      setResponse(res.data.results);
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  return (
    <div>
      <h1>Upload Image and Enter Prompt</h1>
      <input type="file" onChange={handleFileChange} />
      <input
        type="text"
        placeholder="Enter your prompt"
        value={prompt}
        onChange={handlePromptChange}
      />
      <button onClick={handleSubmit}>Upload</button>
      {response && (
        <div>
          <h2>Analysis Result</h2>
          <pre>{JSON.stringify(response, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default ImageUploadPrompt;
