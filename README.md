# FocusForge AI

> AI-powered study monitoring and productivity web application that helps students stay focused, track study sessions, and understand their productivity through AI-assisted monitoring and analytics.

## Overview

FocusForge AI is a full-stack study productivity application designed to help students maintain focus during study sessions.

During a study session, the application uses the user's webcam and AI-based computer vision to monitor signals such as face visibility, eye state, phone presence, and study material presence. Based on these detections, the application calculates distraction events and a focus score.

After a session is completed, the session data is stored in MongoDB and can be viewed through reports and productivity analytics.

---

## Features

-  Real-time study session monitoring
-  Eye-state detection
-  Phone detection
-  Study material/book detection
-  Prolonged eye-closure detection
-  AI-assisted emotion analysis
-  Distraction alerts
-  Focus score calculation
-  Study streak tracking
-  Daily, weekly, and monthly productivity reports
-  Study session history
-  AI-generated quizzes
-  AI-based quiz explanations
-  Friends and challenge features
-  JWT-based authentication
-  Responsive user interface

---

## How It Works

The main study-session flow is:


User
  ↓
Study Session
  ↓
Webcam + AI Monitoring
  ↓
Face / Eye / Phone / Book Detection
  ↓
Application Decision Logic
  ↓
Distraction & Focus Score Calculation
  ↓
Stop Session
  ↓
Backend API
  ↓
MongoDB
  ↓
Reports & Analytics
