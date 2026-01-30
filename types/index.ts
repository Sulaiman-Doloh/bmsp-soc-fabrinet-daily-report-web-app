// types/index.ts
export interface Incident {
  inc_no: string;
  incident_name: string;
  customer: string;
  status: string;
  incident_date: string; // หรือ Date
  // เพิ่ม field อื่นๆ ที่มีใน database ตามต้องการ
}