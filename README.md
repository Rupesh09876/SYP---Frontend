# MediCare Frontend

This is the React-based frontend for the Hospital Appointment Management System.

## 📦 Installation

To install all required dependencies for the frontend, run:

```bash
npm install axios recharts lucide-react react-router-dom framer-motion react-modal web-vitals
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

---

## 🚀 Running the App

1. Install dependencies (see above).
2. Create/Check `.env` file:
   ```env
   REACT_APP_API_URL=http://localhost:5001/api
   REACT_APP_GEMINI_API_KEY=your_key
   REACT_APP_KHALTI_PUBLIC_KEY=your_key
   ```
3. Start the project:
   ```bash
   npm start
   ```

---

## 📱 Mobile Access Troubleshooting
Scanning the QR code on mobile may result in a "localhost unreachable" error. This is because `localhost` refers to the mobile device itself.

**Solution:**
Use your computer's local IP address (e.g., `192.168.1.XX`) instead of `localhost` in your `.env` and browser. See the [Root README](../README.md#-mobile-testing-qr-code-scan) for more details.

---

## 📄 Documentation
- [SRS Document](../SRS.md)
- [System Walkthrough](../brain/walkthrough.md)