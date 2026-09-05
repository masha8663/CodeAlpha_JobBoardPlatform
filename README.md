# 💼 CodeAlpha_JobBoardPlatform (HireSphere)

An enterprise job portal and recruitment system built with Node.js, Express.js, MongoDB, and Multer for resume document uploads.

---

## 📌 Project Overview
**HireSphere** is a career web application allowing employers to post job opportunities while candidates can search, filter, and apply directly by uploading PDF/Doc resumes. It features email-based application tracking and an admin portal for candidate status management.

---

## ✨ Key Features
* **🔍 Multi-Filter Search:** Real-time job search by keywords, category, and job types (Full-Time, Remote, Contract).
* **💼 Job Posting Engine:** Interactive portal for companies to publish active career opportunities.
* **📎 Resume File Upload:** Powered by Multer for handling candidate resume uploads.
* **📊 Candidate Status Tracker:** Email-based tracker for candidates to check application status updates.
* **🛡️ Admin Directory Management:** Review submitted applications, download resumes, and update recruitment statuses.

---

## 🛠️ Tech Stack
* **Backend:** Node.js, Express.js
* **File Handling:** Multer
* **Database:** MongoDB (Mongoose ODM)
* **Frontend:** HTML5, CSS3, JavaScript, Bootstrap 5, FontAwesome

---

## 📁 Project Structure
```text
CodeAlpha_JobBoardPlatform/
├── index.js            # Express server, Multer routing & REST APIs
├── models.js           # Mongoose Database Schemas
├── index.html          # Dynamic Bootstrap single-page UI
├── package.json        # Dependencies & scripts
└── .gitignore          # Ignored files (node_modules, uploads)
