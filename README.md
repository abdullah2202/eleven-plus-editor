# Eleven Plus Editor

A modern, premium web application designed to create and manage Verbal and Non-Verbal reasoning questions for educational applications.

## 🌟 Purpose

The **Eleven Plus Editor** provides a streamlined interface for educators and content creators to build complex logic puzzles. It ensures that all generated questions adhere to strict JSON schemas while offering powerful visual tools for non-verbal reasoning.

## ✨ Key Features

### 1. Question Editor
- **Verbal Reasoning (VR)**: Create analogies, odd-one-out, synonyms, antonyms, and sequence puzzles.
- **Non-Verbal Reasoning (NVR)**: Build visual puzzles with support for sequences and odd-one-out logic.
- **Real-time Preview**: Live JSON code blocks show the exact structure of the data as you type.
- **Schema Validation**: Built to output data compatible with standard reasoning app schemas.

### 2. Shape Editor
- **SVG Drawing Canvas**: A custom-built SVG drawing tool to create visual components from scratch.
- **Drawing Tools**: Rectangle, Circle, Triangle, and Line tools with an integrated Eraser.
- **Styling**: Full control over stroke color, fill color, and line width.
- **Rotation**: Rotate the entire canvas to create complex directional puzzles.
- **SQLite Integration**: Save your custom shapes to a local library for reuse across different questions.

### 3. Shape Library
- **Centralized Management**: Browse all your saved custom SVGs in a compact grid view.
- **Quick Export**: One-click "Copy SVG" to use your shapes in the NVR Question Editor.
- **Persistent Storage**: Uses a local SQLite database (`server/shapes.db`) to keep your library safe.

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) installed on your machine.

### Installation
1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```

### Running the App
The app runs a concurrent setup with a Vite frontend and an Express backend:
```bash
npm run dev
```
Navigate to [http://localhost:5173](http://localhost:5173) in your browser.

## 🛠 Technology Stack
- **Frontend**: React 19, TypeScript, Vite, Framer Motion, Lucide Icons.
- **Backend**: Node.js, Express.
- **Database**: SQLite (via `better-sqlite3`).
- **Styling**: Pure Vanilla CSS with a focus on Glassmorphism and modern Dark Mode aesthetics.

## 📁 Project Structure
- `src/components`: UI components for editors and library.
- `src/schemas`: JSON schemas for VR and NVR questions.
- `server/`: Backend API and SQLite database configuration.
