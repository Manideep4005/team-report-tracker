import api from "./api";


export async function getDashboard() {
  const { data } = await api.get("/api/reports/dashboard");
  return data;
}

export async function saveReport(description: string) {
  const { data } = await api.post("/api/reports/create", {
    description,
  });

  return data;
}

export async function getHistory(date?: string) {
  const { data } = await api.get("/api/reports/history", {
    params: date ? { date } : {},
  });

  return data;
}

export async function getSummary() {
  const { data } = await api.get("/api/reports/summary");
  return data;
}