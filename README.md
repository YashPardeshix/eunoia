# 🚀 SkillPilot: AI-Powered Learning Coach

> "Stop researching, start learning."

## 💡 Core Problem Solved

Learners waste significant time and mental effort curating a learning path and finding reliable resources. SkillPilot instantly generates structured, personalized roadmaps.

## ✨ Features (Minimum Viable Product - MVP)

The MVP is focused on delivering the core value:

- **Goal Input:** Users enter a free-text learning goal (e.g., "Learn backend development").
- **AI Roadmap Generation:** An API call generates a structured path (modules, milestones, outcomes).
- **Progress Tracking:** Users can mark topics complete and view overall progress.
- **Adaptive Suggestions:** The AI provides the next step based on the user's latest progress.

## 🛠️ Technology Stack

This project is built using the industry-standard MERN stack with modern AI integration.

| Layer                 | Technology              | Why We Chose It                                                               |
| :-------------------- | :---------------------- | :---------------------------------------------------------------------------- |
| **Frontend**          | React.js + Tailwind CSS | Component-based, dynamic UI, and professional styling.                        |
| **Backend**           | Node.js (Express)       | Single-language development (JavaScript) for simplicity.                      |
| **Database**          | MongoDB (NoSQL)         | Flexible schema ideal for dynamic AI-generated roadmaps.                      |
| **AI/LLM**            | OpenAI API (GPT-4)      | For core generation and adaptive logic.                                       |
| **Persistence (MVP)** | Local Storage           | Chosen as a pragmatic trade-off to simplify V1 and focus on core AI features. |

## 🎯 Success Criteria (The Definition of "Done")

1. [User can create a learning goal and get an AI-generated roadmap.]
2. [User can track and update learning progress.]
3. [AI dynamically recommends the next learning step.]

## 🏗️ Architecture & Build Order (Our Professional Roadmap)

_This section will be filled out in Phase 3._

## ⚙️ Setup & Installation

1. **Clone the repository:** `git clone [Your GitHub Repo URL]`
2. **Install Dependencies:**
   - **Backend:** `cd server` then `npm install`
   - **Frontend:** `cd client` then `npm install`
3. **Configuration:** Create a `.env` file in the `server` directory and add your OpenAI API key.

---

### 🛣️ Future Work (V2 Roadmap)

- Full Authentication (Sign-up/Login)
- Advanced Resource Curation (RAG/Vector DB integration)
- [Other Nice-to-Have Features...]
