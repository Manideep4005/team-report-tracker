import api from "./api";

export async function getDashboard() {
  const { data } = await api.get("/api/dashboard");
  return data;
}

export async function saveReport(description: string) {
  const { data } = await api.post("/api/reports", {
    description,
  });

  return data;
}

export async function getTodayReport() {
  const { data } = await api.get("/api/reports/today");
  return data;
}

export async function getHistory(date?: string) {
  const { data } = await api.get("/api/reports/history", {
    params: date ? { date } : {},
  });

  return data;
}

export async function getSummary() {
  const { data } = await api.get("/api/summary");
  return data;
}

export async function getTeamReports() {
  const { data } = await api.get("/api/team");
  return data;
}