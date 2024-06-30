// ImageUpload.js
import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 200px;
  border: 2px dashed #ccc;
  border-radius: 10px;
  cursor: pointer;
  background-color: #fafafa;
`;

const ImageUpload = ({ onUpload }) => {
  const onDrop = useCallback(
    (acceptedFiles) => {
      // Handle the file upload here
      const file = acceptedFiles[0];
      onUpload(file);
    },
    [onUpload]
  );

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  return (
    <Container {...getRootProps()}>
      <input {...getInputProps()} />
      <p>Drag & drop an image here, or click to select one</p>
    </Container>
  );
};

export default ImageUpload;
