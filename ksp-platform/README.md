# KSP Intelligence Platform

An advanced intelligence and predictive analytics platform for the Karnataka State Police, designed to track crime trends, predict hotspots, and provide actionable insights via an AI Copilot.

## Live Application
**URL:** [CATALYST_URL]

## Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd ksp-platform
   ```

2. **Install Frontend Dependencies:**
   ```bash
   cd client
   npm install
   ```

3. **Install Backend Dependencies:**
   ```bash
   cd ../server
   python -m venv .venv
   source .venv/Scripts/activate  # On Windows (use source .venv/bin/activate on Linux/Mac)
   pip install -r requirements.txt
   ```

4. **Environment Configuration:**
   - Create a `.env` file in the `server` directory (you can copy from `.env.example` if available).
   - Add your `GEMINI_API_KEY` to the `.env` file:
     ```env
     GEMINI_API_KEY=your_api_key_here
     ```

5. **Run the Application Locally:**
   From the project root directory, use the Makefile to start both servers:
   ```bash
   make dev
   ```

## Team Members
- [Member 1]
- [Member 2]
- [Member 3]
- [Member 4]

## Screenshots
*(Add screenshots of the dashboard, predictive analytics, and chatbot here)*
