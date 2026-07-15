import api from "./api";


export async function getDashboard() {
  const { data } = await api.get("/reports/dashboard");
  return data;
}

export async function saveReport(description: string) {
  const { data } = await api.post("/reports/create", {
    description,
  });

  return data;
}

export async function getHistory(date?: string) {
  const { data } = await api.get("/reports/history", {
    params: date ? { date } : {},
  });

  return data;
}

export async function getSummary() {
  const { data } = await api.get("/reports/summary");
  return data;
}