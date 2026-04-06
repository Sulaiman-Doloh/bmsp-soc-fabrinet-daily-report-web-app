# Fabrinet Daily Report

## 📌 Overview

Fabrinet Daily Report เป็นระบบอัตโนมัติสำหรับสร้าง SOC Daily Report โดยดึงข้อมูลจาก API ของ:

* AlienVault
* Cyware

ระบบจะรวบรวมข้อมูล → ประมวลผล → สร้างรายงาน → Export เป็น PDF
เพื่อลดเวลาและลดข้อผิดพลาดในการทำ Daily SOC Report

---

## 🚀 Features

* Generate SOC Daily Report อัตโนมัติ
* ดึงข้อมูลจาก AlienVault API
* ดึงข้อมูลจาก Cyware API
* Export เป็น PDF
* เลือกวันที่ Report ได้
* UI Dashboard
* Docker Ready
* Deploy Server ได้
* ลด Human Error

---

## 🏗️ Tech Stack

* Next.js
* TypeScript
* TailwindCSS
* Docker

---

## 🔄 System Workflow

```
AlienVault API
      ↓
Cyware API
      ↓
Data Processing
      ↓
Generate Report
      ↓
Export PDF
```

---

## 📂 Project Structure

```
├── 📁 app
│   ├── 📁 api
│   │   └── 📁 soc-report
│   │       └── 📄 route.ts
│   ├── 📁 dashboard
│   │   ├── 📁 report
│   │   │   └── 📄 page.tsx
│   │   └── 📄 layout.tsx
│   ├── 📁 report
│   │   └── 📄 page.tsx
│   ├── 📄 favicon.ico
│   ├── 🎨 globals.css
│   ├── 📄 layout.tsx
│   └── 📄 page.tsx
├── 📁 components
│   ├── 📁 report-table
│   │   ├── 📄 IncidentAlarm.tsx
│   │   ├── 📄 IncidentPending.tsx
│   │   └── 📄 RecommendAction.tsx
│   └── 📁 sidebar
│       └── 📄 Sidebar.tsx
├── 📁 context
│   └── 📄 ReportContext.tsx
├── 📁 public
│   ├── 📁 images
│   │   ├── 🖼️ action.png
│   │   ├── 🖼️ alarm.png
│   │   ├── 🖼️ header.png
│   │   └── 🖼️ pending.png
│   ├── 🖼️ file.svg
│   ├── 🖼️ globe.svg
│   ├── 🖼️ next.svg
│   ├── 🖼️ vercel.svg
│   └── 🖼️ window.svg
├── 📁 types
│   └── 📄 index.ts
├── ⚙️ .gitignore
├── 📝 README.md
├── 📄 eslint.config.mjs
├── 📄 next.config.ts
├── ⚙️ package-lock.json
├── ⚙️ package.json
├── 📄 postcss.config.mjs
├── 📄 tailwind.config.ts
└── ⚙️ tsconfig.json
```

---

## ⚙️ Environment Variables

สร้างไฟล์ `.env`

```
# AlienVault Config
ALIENVAULT_SUBDOMAIN=#########################################
ALIENVAULT_CLIENT_ID=#########################################
ALIENVAULT_CLIENT_SECRET=#######################################

# Cyware Config
CYWARE_ACCESS_ID=#############################################
CYWARE_SECRET_KEY=#############################################
CYWARE_BASE_URL=https://bangkokmsp.cyware.com/cftrapi
```

---

## 🚀 Run Project

Run แบบปกติ

```
docker compose up --build
```

Run background

```
docker compose up -d --build
```

---

## ⚠️ Important: After Updating Configuration

หากมีการแก้ไขไฟล์ต่อไปนี้:

* `.env`
* `Dockerfile`
* `docker-compose.yml`
* `package.json`
* Source code

จำเป็นต้อง rebuild container ใหม่ทุกครั้ง

ให้รันคำสั่ง:

```
docker compose up -d --build
```

เพื่อ:

* Rebuild image ใหม่
* โหลดค่า `.env` ใหม่
* Apply config ใหม่
* Restart container

<!-- --- -->

<!-- ## 🖥️ Deploy on Server

### 1. Create Folder

```
mkdir fabrinet-daily-report
cd fabrinet-daily-report
```

---

### 2. Clone Project

```
git clone <your-repo>
cd project
```

---

### 3. Create .env

```
nano .env
```

---

### 4. Create Dockerfile

```
nano Dockerfile
```

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

### 5. Create docker-compose

```
nano docker-compose.yml
```

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
``` -->

---

## 📄 Output

ระบบจะสร้าง:

* SOC Daily Report
* Incident Alarm Summary
* Incident Pending
* Recommend Action

Export เป็น:

```
PDF Report
```

---

## 🔐 Cyware API Configuration

หาก API ของ Cyware หมดอายุ:

Generate API ใหม่ และเปลี่ยนใน `.env`

```
CYWARE_API_KEY=NEW_API_KEY
```

⚠️ ไม่ต้องแก้ BASE URL

ใช้:

```
https://bangkokmsp.cyware.com/cftrapi
```

ไม่ใช้:

```
https://bangkokmsp.cyware.com/cftrapi/openapi
```

URL `/openapi` ใช้สำหรับ documentation (read only)

ระบบนี้ใช้ URL หลักเพื่อ:

* Read Data
* Update Data
* Generate Report

---

## 🎯 Purpose

ระบบนี้ถูกพัฒนาเพื่อ:

* Automate SOC Daily Report
* ลดเวลาการทำงาน
* ลด Human Error
* เพิ่มความถูกต้องของข้อมูล
* ใช้งานง่ายสำหรับ SOC Analyst

---

## 👨‍💻 Author

BMSP SOC Team

---

## 🏢 Project

Fabrinet SOC Daily Report Automation
