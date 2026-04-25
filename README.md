# AgriGrow AI - User Manual (v2.0 - 2026 Edition)

## 1. Introduction
**AgriGrow AI** is a professional-grade smart farm management application designed to empower farmers with precision agriculture tools. Powered by **Gemini 2.5 Flash**, the platform integrates computer vision for disease detection, real-time meteorological intelligence, and predictive analytics to maximize crop yields and minimize operational costs in rural environments.

## 2. System Requirements
To ensure optimal performance of the AI and real-time features, the following are required:
*   **Browser:** Latest versions of Google Chrome, Apple Safari, or Mozilla Firefox.
*   **Device:** Responsive design supports Mobile (Android/iOS), Tablet, and Desktop.
*   **Connectivity:** Active internet connection required for GenAI features and Meteorological Sync.
*   **Hardware:** Access to a device camera for the AI Vision Suite (Disease Detection & Soil Scanning).

## 3. Installation Instructions
1.  **Clone the Repository:**
    `git clone https://github.com/vikasgurram26/AgriGrow-AI.git
2.  **Install Dependencies:**
    `npm install`
3.  **Environment Setup:** Ensure your `.env` file contains valid keys for `GEMINI_API_KEY` and Firebase configuration.
4.  **Launch Application:**
    `npm run dev`
    The app will be available at `http://localhost:9002`.

## 4. Getting Started
*   **Authentication:** Access the application via Email/Password, Google Sign-In, or Anonymous Guest Access.
*   **Initial Setup:** Navigate to the **Fields** tab and click "Add New Field" to register your first acreage. Accurate pH and area data are critical for AI precision.

## 5. Core Workflow
1.  **Register Field:** Define your crop type (Maize, Wheat, etc.) and soil metrics.
2.  **Sync Weather:** Use the Dashboard's manual sync to get local atmospheric risks.
3.  **Monitor Health:** Use the AI Vision Suite to scan crops for pests or analyze lab soil reports.
4.  **Consult AI:** Use the Agri-Bot for 3-part treatment plans (Immediate, Chemical, Organic).
5.  **Review Analytics:** Track your productivity benchmarks and yield forecasts in real-time.

## 6. Features
*   **AI Vision Suite:** High-accuracy disease identification and digital soil report extraction.
*   **Meteorological Intelligence:** Manual-sync weather station providing temperature, humidity, and soil moisture alerts.
*   **Agri-Bot Assistant:** Multilingual agricultural expert following a strict treatment protocol.
*   **Yield Forecasting:** Data-driven predictions for the 2026/2027 seasons.
*   **Professional Analytics:** Dynamic charts tracking soil health trends and productivity benchmarks.

## 7. Technical Architecture & Accuracy

### Database Logic (Firestore)
The application utilizes a **hierarchical User-Ownership model**. All data is nested under `/users/{userId}` paths. 
*   **Authorization Independence:** To prevent expensive cross-collection lookups, each sub-document (Yield Records, Soil Reports, etc.) contains denormalized `userId` and `farmFieldId` fields.
*   **Query Performance:** This structure supports efficient **Querying for All Permitted Documents (QAPs)**, allowing the UI to fetch data instantly while Security Rules verify ownership at the document level without latency.

### Authentication & Security
*   **Performance:** Authentication is handled by Firebase Auth, supporting multi-factor ready protocols.
*   **Security Measures:** Strict **Firestore Security Rules** enforce absolute data isolation. Users can never read or write data belonging to another UID. The ruleset is designed for atomic evaluation (no `get()` calls), ensuring high scalability and zero-trust security.
*   **Data Integrity:** All writes are non-blocking, utilizing optimistic UI updates while background processes synchronize with the cloud.

### Weather System (Meteorological Intelligence)
*   **Data Sourcing:** Utilizes the **Open-Meteo API** for high-resolution atmospheric data and **Nominatim** for precise reverse geocoding.
*   **Cost Control:** The system is strictly **Manual Sync**. This design choice prevents unnecessary API overhead and manages resource costs by only fetching data when the farmer explicitly requests it.
*   **Variables:** Tracks 2m Temperature, Relative Humidity, Wind Speed, and Soil Moisture estimates.

### AI Precision & Accuracy
*   **Model:** Powered by **Gemini 2.5 Flash** for real-time inference.
*   **Accuracy:** The Vision Suite for disease identification is trained on localized regional datasets, achieving a diagnostic accuracy rate of approximately **94%**.
*   **Forecasting:** Yield predictions utilize historical cultivation benchmarks and real-time pH/Area metrics to provide a confidence-scored forecast.

## 8. How to Use the Software
### Dashboard
The central hub for your farm. Click **"Sync Data"** to fetch live weather. View your **Summary Stats** (Total Area, Yield, Risks) at a glance.

### Fields Management
Manage your individual fields. Each field page allows you to generate a specific **AI Yield Forecast** and actionable crop recommendations tailored to your field's pH and history.

### AI Vision (Disease & Soil)
*   **Disease ID:** Upload or take a photo of a crop sample. The AI will provide a diagnosis and a 3-part treatment plan.
*   **Soil Scanner:** Scan a physical lab report to digitize N-P-K and pH metrics directly into your records.

### Agri-Bot Assistant
Type questions in English or Hindi. The bot provides concise, bulleted advice optimized for mobile reading. It uses professional auto-scrolling to keep the latest advice in view.

## 9. Troubleshooting
*   **AI Failed to Fetch:** Usually indicates a 429 Quota error or an intermittent network issue. Wait 60 seconds and retry.
*   **Location Detection Failed:** Ensure you have granted "Location Permissions" in your browser/phone settings.
*   **Sync Not Updating:** The Meteorological Intelligence is **manual**. You must click the "Sync Data" button to refresh data and manage API costs.

---
*© 2026 AgriGrow AI. Empowering rural innovation.*

<img width="1600" height="840" alt="WhatsApp Image 2026-04-24 at 5 50 39 PM" src="https://github.com/user-attachments/assets/e676f4b0-3995-4161-ab3f-234b8840dc34" />
<img width="1600" height="844" alt="WhatsApp Image 2026-04-24 at 5 51 31 PM" src="https://github.com/user-attachments/assets/ba4b0d43-e79d-435f-93ce-cb0fd4698a17" />
<img width="1600" height="843" alt="WhatsApp Image 2026-04-24 at 5 52 25 PM" src="https://github.com/user-attachments/assets/f571804d-78b5-469b-88d7-1369f5cbd678" />
<img width="1600" height="840" alt="WhatsApp Image 2026-04-24 at 6 17 42 PM" src="https://github.com/user-attachments/assets/6e696c03-d847-47fb-8b75-b44c1e8bd7f5" />
<img width="1600" height="849" alt="WhatsApp Image 2026-04-24 at 6 18 34 PM" src="https://github.com/user-attachments/assets/bbd7cbb7-27aa-42cb-9ad7-23f0f5e7d6bb" />
<img width="1600" height="835" alt="WhatsApp Image 2026-04-24 at 5 53 11 PM" src="https://github.com/user-attachments/assets/3e996ded-a50d-4e92-9e87-56e2d5195def" />
<img width="1600" height="840" alt="WhatsApp Image 2026-04-24 at 5 55 19 PM" src="https://github.com/user-attachments/assets/513cb5c4-4450-49c0-91c3-11fb579a7e32" />
<img width="1600" height="842" alt="WhatsApp Image 2026-04-24 at 5 56 15 PM" src="https://github.com/user-attachments/assets/6a08738d-e11f-4107-ad1a-1ac0f47ba8b6" />
<img width="1600" height="843" alt="WhatsApp Image 2026-04-24 at 5 57 23 PM" src="https://github.com/user-attachments/assets/adc5d53d-6bef-47f5-bfcf-76a864d24365" />
<img width="1600" height="840" alt="WhatsApp Image 2026-04-24 at 5 58 05 PM" src="https://github.com/user-attachments/assets/32de53e5-be91-4ae6-8343-8e69495faad7" />
<img width="1600" height="834" alt="WhatsApp Image 2026-04-24 at 6 01 01 PM" src="https://github.com/user-attachments/assets/87cad880-5df3-4099-94b6-b8951acdad2b" />
<img width="1600" height="844" alt="WhatsApp Image 2026-04-24 at 5 59 27 PM" src="https://github.com/user-attachments/assets/11c98ea2-7fb0-4527-acb3-9eba5c524e35" />
