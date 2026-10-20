const A = "/analyst", D = "/admin";
export const searchIndex = [
  { label: "Overview", path: A, keys: "files validated errors completeness dashboard cards", role: "analyst" },
  { label: "Data Validation", path: A + "/validation", keys: "upload file preview rules validate excel null duplicate outlier", role: "analyst" },
  { label: "Validation History", path: A + "/history", keys: "history past runs previous validations", role: "analyst" },
  { label: "Reports", path: A + "/reports", keys: "flagged reports download errors", role: "analyst" },
  { label: "Settings", path: A + "/settings", keys: "profile theme dark password reset", role: "analyst" },
  { label: "Help & Guidance", path: A + "/help", keys: "help guide faq how to rules support", role: "analyst" },
  { label: "Overview", path: D, keys: "total analysts reports active dashboard", role: "admin" },
  { label: "Rule Library", path: D + "/rules", keys: "rules add edit delete predefined library", role: "admin" },
  { label: "User Management", path: D + "/users", keys: "users analysts admins access remove add role", role: "admin" },
  { label: "Settings", path: D + "/settings", keys: "profile theme dark password", role: "admin" },
];
