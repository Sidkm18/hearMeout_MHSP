# hearMeout - Your Mental Wellness Companion

<p align="center">
  <strong>A safe and supportive space for students to prioritize their mental well-being.</strong>
</p>

---

## ✨ About The Project

**hearMeout** is a comprehensive web application designed to provide students with accessible and confidential mental health resources. From an AI-powered companion for daily check-ins to a secure journaling platform and counsellor booking system, hearMeout aims to destigmatize mental health and make support readily available.

This application is built with a modern, robust, and scalable tech stack, making it a great starting point for further development and customization.

---

## 🚀 Core Features

The application features a multi-role system to cater to the needs of different user groups.

### For Students:
*   **AI Companion**: Engage in supportive conversations with an AI chatbot that tailors its responses to your mood.
*   **Private Journal**: A secure space to write journal entries, track your mood over time, and get AI-generated prompts for self-reflection.
*   **Counsellor Booking**: View counsellor profiles, check their availability, and book one-on-one sessions.
*   **Self-Assessments**: Take confidential medical questionnaires (like PHQ-9 for depression and GAD-7 for anxiety) to gain insight into your mental state.
*   **Anonymous Forums**: Connect with peers and volunteers in a safe, anonymous space to share experiences and find support.
*   **Resource Library**: Access a curated collection of articles, videos, and books to support your mental wellness journey.
*   **Emergency Support**: Quick access to crisis hotlines and calming exercises.

### For Counsellors:
*   **Dashboard**: Manage your schedule, view upcoming appointments, and set your weekly availability.
*   **Student Insights**: With student consent, view their self-assessment results to better prepare for sessions.
*   **Resource Management**: Contribute to the self-help resource library.
*   **Forum Moderation**: Engage with and moderate the community forums.

### For Admins:
*   **User Approval System**: Review and approve/reject registrations for counsellors and volunteers.
*   **Platform-Wide Management**: Manage all resources in the library and oversee all appointments.
*   **Feedback Review**: View and act on feedback submitted by students about counsellors.

---

## 🛠️ Tech Stack

*   **Framework**: [Next.js](https://nextjs.org/) (with App Router)
*   **Language**: [TypeScript](https://www.typescriptlang.org/)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
*   **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
*   **Database & Auth**: [Firebase (Firestore & Authentication)](https://firebase.google.com/)
*   **Generative AI**: [Google's Genkit](https://firebase.google.com/docs/genkit) with the Gemini models.

---

## 🏁 Getting Started

Follow these steps to get a local copy up and running.

### Prerequisites

*   **Node.js**: Version 18.x or higher.
*   **Firebase Account**: You will need a Google account to create a Firebase project.
*   **Google AI API Key**: To use the Genkit features, you'll need a Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey).

### Installation Steps

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/your-username/hearMeout.git
    cd hearMeout
    ```

2.  **Install NPM packages:**
    ```sh
    npm install
    ```

3.  **Set up your Firebase project:**
    *   Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
    *   In your project, create a new **Web App**.
    *   Copy the `firebaseConfig` object. You will need this for your environment variables.
    *   In the Firebase console, go to **Build > Authentication** and enable the **Email/Password** sign-in method.
    *   Go to **Build > Firestore Database**, create a database, and start in **test mode** (you can configure security rules later).

4.  **Set up environment variables:**
    *   Create a new file named `.env` in the root of your project.
    *   Update `src/lib/firebase.ts` with your firebaseConfig details.
    *   Add your Gemini API Key to the `.env` file:
        ```
        GEMINI_API_KEY=your_gemini_api_key_here
        ```
    *   Your `src/lib/firebase.ts` file should be updated with the configuration object from your Firebase project.

5.  **Run the development server:**
    ```sh
    npm run dev
    ```
    The application should now be running on `http://localhost:9002`.

---

## 👨‍💻 Contributors

Thanks to all these amazing people who made **hearMeout** possible! 💙

<p align="center">
  <a href="https://github.com/sudoDreamer">
    <img src="https://github.com/sudoDreamer.png" width="100px;" alt=""/>
    <br />
    <sub><b>Shounak Dutta</b></sub>
  </a>
  <a href="https://github.com/AryannnG">
    <img src="https://github.com/AryannnG.png" width="100px;" alt=""/>
    <br />
    <sub><b>Aryan Gaikwad</b></sub>
  </a>
  <a href="https://github.com/swanandi22">
    <img src="https://github.com/swanandi22.png" width="100px;" alt=""/>
    <br />
    <sub><b>Swanandi Nikam</b></sub>
  </a>
  <a href="https://github.com/samikshaphirangi">
    <img src="https://github.com/samikshaphirangi.png" width="100px;" alt=""/>
    <br />
    <sub><b>Samiksha Phirangi</b></sub>
  </a>
  <a href="https://github.com/NirvedGhose">
    <img src="https://github.com/NirvedGhose.png" width="100px;" alt=""/>
    <br />
    <sub><b>Nirved Ghose</b></sub>
  </a>
  <a href="https://github.com/sidkm18">
    <img src="https://github.com/sidkm18.png" width="100px;" alt=""/>
    <br />
    <sub><b>Sidharth Kamath</b></sub>
  </a>
</p>
