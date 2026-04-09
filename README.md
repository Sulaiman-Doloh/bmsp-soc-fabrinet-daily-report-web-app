# Fabrinet Daily Report

## 📌 Overview

**Fabrinet Daily Report** เป็นระบบอัตโนมัติสำหรับสร้าง SOC Daily Report โดยดึงข้อมูลจาก Security Platform ผ่าน API ได้แก่

* AlienVault
* Cyware

ระบบจะรวบรวมข้อมูล → ประมวลผล → สร้างรายงาน → Export เป็น **PDF** เพื่อใช้งานใน Daily SOC Report

---

## 🎯 Features

* ดึงข้อมูลจาก AlienVault API
* ดึงข้อมูลจาก Cyware API
* Generate SOC Daily Report อัตโนมัติ
* Export รายงานเป็น PDF
* UI สำหรับเลือกวันที่ Report
* Docker Ready
* Deploy บน Server ได้ทันที
* ลด Manual Work ของ SOC Analyst
* ลด Human Error ใน Daily Report

---

## 🏗️ Tech Stack

* Next.js (App Router)
* TypeScript
* Tailwind CSS
* Docker
* REST API Integration

---

## 📂 Project Structure

```
├── app
│   ├── api
│   │   └── soc-report
│   │       └── route.ts
│   ├── dashboard
│   │   ├── report
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── report
│   │   └── page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
│
├── components
│   ├── report-table
│   │   ├── IncidentAlarm.tsx
│   │   ├── IncidentPending.tsx
│   │   └── RecommendAction.tsx
│   │
│   └── sidebar
│       └── Sidebar.tsx
│
├── context
│   └── ReportContext.tsx
│
├── public/images
│
├── types
│   └── index.ts
│
├── .env
├── package.json
├── tsconfig.json
└── README.md
```

---

## ⚙️ Environment Variables

สร้างไฟล์ `.env`

```
ALIENVAULT_API_KEY=

CYWARE_API_KEY=

CYWARE_BASE_URL=https://bangkokmsp.cyware.com/cftrapi
```

---

## 🚀 Run Project (Docker)

```bash
docker compose up --build
```

Run background

```bash
docker compose up -d --build
```

Check container

```bash
docker ps
```

Check logs

```bash
docker logs -f <container-name>
```

---

## 🐳 Dockerfile

```
FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm","start"]
```

---

## 🐳 docker-compose.yml

```
version: "3"

services:
  web:
    build: .
    ports:
      - "3000:3000"
    restart: always
```

---

## 🖥️ Deploy on Server

### 1. Create Project Folder

```
mkdir fabrinet-daily-report
cd fabrinet-daily-report
```

### 2. Clone Project

```
git clone <your-repo>
cd project
```

### 3. Create .env

```
nano .env
```

### 4. Create Dockerfile

```
nano Dockerfile
```

Paste Dockerfile content

---

### 5. Create docker-compose

```
nano docker-compose.yml
```

---

### 6. Build & Run

```
docker compose up -d --build
```

---

### 7. Check Container

```
docker ps
```

---

### 8. Check Logs

```
docker logs -f bmsp-soc-fabrinet-daily-report-web-app-web-1
```

---

## 📄 Output

ระบบจะสร้างรายงานเป็น:

* SOC Daily Report
* Incident Alarm Summary
* Incident Pending
* Recommend Action

Export เป็น:

```
PDF Report
```

---

## 🔄 Cyware API Renewal

หาก API ของ Cyware หมดอายุ:

1. Generate API ใหม่จากระบบ Cyware
2. นำ API ใหม่มาแทนค่าใน `.env`

```
CYWARE_API_KEY=NEW_API_KEY
```

⚠️ ไม่ต้องแก้ค่า BASE URL

ใช้ค่าเดิม:

```
CYWARE_BASE_URL=https://bangkokmsp.cyware.com/cftrapi
```

---

### ❗ Important

URL ที่ได้จากการ generate API ใหม่:

```
https://bangkokmsp.cyware.com/cftrapi/openapi
```

URL นี้ใช้สำหรับ **Documentation / Read Only เท่านั้น**

แต่ระบบนี้ใช้:

```
https://bangkokmsp.cyware.com/cftrapi
```

ซึ่งสามารถ:

* Read Data
* Update Data
* Generate Report

ได้ครบ

---

## 🧠 System Workflow

```
AlienVault API
        ↓
Cyware API
        ↓
Data Processing
        ↓
Generate SOC Report
        ↓
Render UI
        ↓
Export PDF
```

---

## 🎯 Purpose

ระบบนี้ถูกพัฒนาเพื่อ:

* Automate SOC Daily Report
* ลดเวลาการทำรายงาน
* ลด Human Error
* เพิ่มความถูกต้องของข้อมูล
* ใช้งานง่ายสำหรับ SOC Analyst

---

## 👨‍💻 Author

BMSP SOC Team

---

## 🏢 Project

Fabrinet SOC Daily Report Automation
