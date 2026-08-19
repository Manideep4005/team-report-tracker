import api from "./api";

export async function getDashboard(
  date?: string
) {
  const { data } = await api.get("/api/dashboard", {
    params: date
      ? { date }
      : undefined,
  });

  return data;
}
export interface SaveReportRequest {
  description: string;
  reportDate: string;
}

export async function saveReport(
  payload: SaveReportRequest
) {
  const { data } = await api.post(
    "/api/reports",
    payload
  );

  return data;
}

export async function getTodayReport() {
  const { data } = await api.get("/api/reports/today");
  return data;
}

export async function getHistory(
  date?: string,
  page = 1,
  limit = 10
) {
  const { data } = await api.get(
    "/api/reports/history",
    {
      params: {
        ...(date ? { date } : {}),
        page,
        limit,
      },
    }
  );

  return data;
}


// export async function getSummary() {
//   const { data } = await api.get("/api/summary");
//   return data;
// }

export async function getTeamReports() {
  const { data } = await api.get("/api/team");
  return data;
}

export async function getAllReports(
  date?: string,
  page = 1,
  limit = 10
) {
  const { data } = await api.get(
    "/api/reports/all",
    {
      params: {
        ...(date ? { date } : {}),
        page,
        limit,
      },
    }
  );

  return data;
}


// export async function getSummaryByDate(date: string) {
//   const { data } = await api.get("/api/summary/by-date", {
//     params: { date },
//   });

//   return data;
// }