# 🎓 LOGIC LANE | Weekly Progress Report Portal

A streamlined, zero-hassle web application built specifically for tutoring and learning centers to deliver **Weekly Progress Reports** directly to parents—eliminating the need to send one-by-one Google Docs, manage Drive folder permissions, or handle cumbersome email attachments.

---

## 📄 Exact Report Structure (Matches Real-World Center Needs)

The core feature of the application directly mirrors the official center **Weekly Progress Report**:

- **Center Branding**: `LOGIC LANE`
- **Document Title**: `Weekly Progress Report`
- **Student Metadata (2-Column Grid)**:
  - **Left**: `Student name`, `Subject`, `Teacher`, `Number of sessions`
  - **Right**: `Grade`, `Meeting days`, `Time`, `Remaining sessions`
- **Date Header**: e.g., `September 30, 2026`
- **Core Narrative Sections**:
  1. **Discussion Today**: Detailed breakdown of math/reading exercises, lesson concepts covered, and learner participation.
  2. **Strengths and Areas for Improvement**: Realistic evaluation of learner engagement, strengths, and specific areas that need continued practice.
  3. **Next Steps**: Concrete lesson goals and targets for upcoming sessions.
- **One-Click Print / Save PDF**: Formatted with dedicated print styles to produce an official clean document.

---

## 🚀 How It Works

### 👨‍👩‍👧 For Parents (The User)
1. **Zero Registration**: Parents open their child's direct link (e.g., `?code=KAL-EL`) or enter their Access Code.
2. **Instant Progress View**: Parents can read today's **Discussion Today**, **Strengths and Areas for Improvement**, and **Next Steps**.
3. **Session Package Tracker**: Real-time view of **Completed Sessions** vs. **Remaining Sessions** (e.g., 12 done, 8 remaining).
4. **Historical Archive**: Easily browse past weekly progress reports.
5. **Print & PDF**: Click **"Print / Save as PDF"** for a clean document ready for printing or saving to their phone.

### 👩‍🏫 For the Teacher (The Admin)
1. **Passcode Protection**: Access Teacher Admin via passcode `1234` (customizable in settings).
2. **Student Roster**: Add and view students with their subject, teacher, meeting schedule, and session package counts.
3. **Write New Weekly Report in Minutes**:
   - Date
   - Completed & Remaining sessions counter
   - **Discussion Today**
   - **Strengths and Areas for Improvement**
   - **Next Steps**
4. **Instant WhatsApp / SMS Sharing**: 1-click formatted message with child's direct link ready to send.

---

## 🏃 Running the Application

### Development Server
```bash
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

- **Teacher Admin Passcode**: `1234`
- **Demo Student Access Codes**:
  - `KAL-EL` (Grade 1 • MWF 2:00-3:00 PM • 12 done, 8 remaining)
  - `MAYA-C` (Grade 3 • TTh 3:30-4:30 PM • 10 done, 6 remaining)
