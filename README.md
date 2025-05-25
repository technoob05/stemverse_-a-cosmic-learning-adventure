# STEMverse: A Cosmic Learning Adventure

## New Feature: AI Storyteller with Gemini

The AI Storyteller feature uses Google's Gemini AI to explain complex concepts through fun stories with adorable cat illustrations. Each explanation is broken down into simple sentences, with a custom illustration generated for each part.

### How to use AI Storyteller:

1. Navigate to the AI Storyteller page from the navigation bar
2. Choose from one of the example topics or enter your own
3. Watch as the AI creates a story with illustrations to explain the concept

### Setup:

To use the AI Storyteller feature, you need to add your Google Gemini API key to the `.env.local` file:

```
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

You can get a Gemini API key from [Google AI Studio](https://aistudio.google.com/).

## About STEMverse

STEMverse is an interactive educational platform that makes learning STEM subjects fun and engaging through a space-themed adventure. Explore different planets representing Math, Coding, and Environmental Science while completing quests and earning rewards.

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
