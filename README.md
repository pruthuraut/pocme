# 🛡️ POCme: AI-Powered CVE Research & PoC Generator

POCme is a high-performance web application designed to automate vulnerability research and simplify Exploit Proof-of-Concept (PoC) generation using the power of **Gemini AI**.

Developed as a streamlined, self-contained Next.js application, POCme enables security researchers to quickly transform a CVE ID into detailed technical intelligence and a weaponized exploit script.

---

## ✨ Key Features

- **🔍 Intelligent CVE Research**: Leverages AI to gather technical details, exploitation vectors, and impacted versions directly from official and community sources.
- **⚡ Automated Exploit Generation**: Produces a language-specific (e.g., Python, Bash) Proof-of-Concept tailored to the specific vulnerability.
- **💅 Premium UI/UX**: A modern, interactive dashboard with real-time feedback and a sleek interface for seamless security workflows.
- **🛠️ Self-Contained**: Everything runs from a single Next.js hub with a focus on simplicity and portability.

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v14.18.0 or later
- **Gemini API Key**: Obtain one from [Google AI Studio](https://aistudio.google.com/)

### Installation

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/pruthuraut/pocme.git
    cd pocme
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Setup Environment Variables**
    Create a `.env.local` file in the root directory:
    ```env
    GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE
    ```

4.  **Run Development Server**
    ```bash
    npm run dev
    ```
    Visit `http://localhost:3000` to start researching!

---

## 🐳 Docker Deployment

For a production-ready environment, you can use the provided Docker configuration.

### Option 1: Docker Compose (Recommended)

1.  Make sure you have your `.env.local` file ready with your `GEMINI_API_KEY`.
2.  Run the application:
    ```bash
    docker-compose up --build
    ```
    Your app will be available at `http://localhost:3000`.

### Option 2: Docker Image

1.  **Build Image**
    ```bash
    docker build -t pocme .
    ```

2.  **Run Container**
    ```bash
    docker run -p 3000:3000 --env-file .env.local pocme
    ```

---

## 🏗️ Architecture

- **Frontend**: Next.js (Pages Router), React, CSS Modules
- **Backend**: Next.js API Routes (`/pages/api/research.js`, `/pages/api/exploit.js`)
- **AI Engine**: Google Gemini Pro via `@google/genai`

---

## 📄 License

This project is licensed under the MIT License. Use responsibly and ethically. For educational and authorized security research purposes only.
