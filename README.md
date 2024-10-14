# AI Business Card Analyzer

## Overview

The **AI Business Card Analyzer** is a personal project designed to digitize and organize business cards collected during job fairs and networking events. This application uses **TensorFlow** and **OpenAI** APIs to analyze business card images, extract contact information, and generate summaries about the companies and individuals on the cards. It also offers features like sharing cards, adding comments, and organizing cards for easy access and search.

### Key Features:
- **Image Analysis**: Uses AI to extract and display contact information.
- **Company and Role Summaries**: Automatically generates summaries using trained GPT model, web scraping, and APIs.
- **Commenting System**: Users can add comments to the analysis for future reference.
- **Sharing with Friends**: Share business cards, comments, and analyses with friends and groups.
- **Easy Search**: Organized and searchable by keywords from the extracted analysis.

## Technologies Used:
- **Front-end**: ReactJS
- **Back-end**: AWS Lambda, API Gateway
- **Authentication**: Google Firebase
- **Data Storage**: AWS DynamoDB
- **Machine Learning**: TensorFlow and OpenAI API
- **Web Scraping**: Integrated to fetch external sources

## Example Photos
- **All Card View
- ![Alt Text](./Photos/E168662B-1566-42BE-B43F-E53B350DDE74.png)
- **Analysis Structure
- ![Alt Text](./Photos/97CAE22D-4BD9-43F8-8BDC-1BD0F7B28B09.png)
- **Analysis View
- ![Alt Text](./Photos/02FE6090-09D2-4D1B-BB79-143AA775D3FE.png)
- **Organizations/Group Chat
- ![Alt Text](./Photos/9629082F-5F1E-4C40-8413-E7D08B362F38.png)






### 1. Install Yarn

If you don't have Yarn installed on your system, you can install it by following these steps:

- Using Homebrew (for macOS):
  ```bash
  brew install yarn
### 2. Clone the Repository



- Using Homebrew (for macOS):
  ```bash
  git clone https://github.com/your-username/ai-business-card-analyzer.git

### 3. Install Dependencies

If you don't have Yarn installed on your system, you can install it by following these steps:

- Using Homebrew (for macOS):
  ```bash
  cd ai-business-card-analyzer
  yarn install

### 4. Start the Development Server



- Using Homebrew (for macOS):
  ```bash
  yarn start

### 5. Build for Production



- Using Homebrew (for macOS):
  ```bash
  yarn build
