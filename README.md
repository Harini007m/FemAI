# 🌸 HERBUDDY 2.0: AI-Driven Women's Health & Wellness Platform

HERBUDDY is a personalized, AI-powered women's health platform designed to help track cycles, predict diagnostic risks, log daily wellness, consult with an AI chatbot, and coordinate with doctors. It features a digital twin model that visualizes your health status based on real-time logging and predictive machine learning models.

---

## 🚀 Key Features

- **🔮 Menstrual Cycle Engine & Digital Twin**: Log start and end dates, pain levels, flow intensity, and PMS symptoms. The system dynamically predicts your next cycle, ovulation, and fertile windows, updating your personal **Digital Twin Health Score**.
- **🧠 Predictive ML Diagnostics**:
  - **PCOS Risk Predictor**: Machine learning survey mapping age, BMI, weight gain, acne, hair growth, and physical activity to predict PCOS risk categories.
  - **Uterine Health Assessment**: Checks pelvic health symptoms to identify risk signals.
  - **Nutritional Deficiency Detector**: Analyzes symptoms (fatigue, hair loss, muscle cramps, etc.) and diet to identify risks for Iron, Vitamin D, and Vitamin B12 deficiencies.
- **💬 Personalized AI Chatbot**: A context-aware chatbot trained to guide users, retrieve their logged metrics, and provide evidence-based lifestyle/wellness recommendations.
- **📊 Wellness & Lifestyle Logger**: Track mood, sleep hours, stress and anxiety levels, water intake, and exercise minutes.
- **👩‍⚕️ Doctor Consultation Portal**: Book appointments with medical specialists. Doctors have a dedicated portal to view scheduled consultations and add clinical checkup/prescription notes.
- **📄 Automated PDF Reports**: Dynamically compile diagnostic predictions, historical cycle data, and symptoms into a professional, shareable PDF summary.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, Tailwind CSS (Vite integration), Chart.js (for wellness tracking visualization), Lucide React (icons).
- **Backend**: Flask 3.x, scikit-learn (ML models), reportlab (PDF generation).
- **Database**: DualDatabase system. Connects to **MongoDB** if running locally, and automatically falls back to **Local JSON Files** in `backend/data/` for a plug-and-play local development experience.

---

## 💻 Getting Started

Follow these steps to run the project locally.

### 1. Clone & Open Workspace
Ensure you are in the project root directory (`d:/femaleai`).

### 2. Set Up the Python Backend
The project uses a Python virtual environment to manage backend dependencies.

```bash
# Create a virtual environment (if not already done)
python -m venv venv

# Activate the virtual environment
# On Windows (Command Prompt or PowerShell):
venv\Scripts\activate

# On macOS / Linux:
source venv/bin/activate

# Install backend dependencies
pip install -r backend/requirements.txt
```

### 3. Run the Flask Server
With the virtual environment active, run:
```bash
python backend/app.py
```
- The backend API will start on **`http://localhost:5000`**.
- It will output whether it successfully connected to MongoDB or fell back to local storage JSON files.

### 4. Set Up the React Frontend
Open a new terminal window in the project root directory.

```bash
# Install node dependencies
npm install

# Start the Vite development server
npm run dev
```
- The frontend will start on **`http://localhost:5173`** (or another port output by Vite).
- Open this URL in your browser to view the application!

---

## 🩺 Demo Accounts
For ease of testing both roles (Patient and Doctor):

| Role | Username | Password |
| :--- | :--- | :--- |
| **Patient** | `harini` | `password123` |
| **Doctor** | `sarah` | `doctor123` |

*(Note: You can also register a new account on the Auth screen).*
