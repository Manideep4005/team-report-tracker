import api from "./api";

export interface ReportUser {
  id: string;
  name: string;
  email: string;
  deletedAt: string | null;
}

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

/*
|--------------------------------------------------------------------------
| REPORT USERS
|--------------------------------------------------------------------------
| GET /api/reports/users
|
| Returns users who have reports, including soft-deleted users
| with historical reports.
|--------------------------------------------------------------------------
*/

export async function getUsersForReports() {
  const { data } = await api.get(
    "/api/reports/users"
  );

  return data;
}

/*
|--------------------------------------------------------------------------
| USER-SPECIFIC REPORTS
|--------------------------------------------------------------------------
| GET /api/reports/user/:userId
|
| Used only when a particular user is selected.
|--------------------------------------------------------------------------
*/

export async function getUserReports(
  userId: string,
  date?: string,
  page = 1,
  limit = 10
) {
  const { data } = await api.get(
    `/api/reports/user/${userId}`,
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

export type ReportExportFilter =
  | {
    filter: "all";
  }
  | {
    filter: "date";
    date: string;
  }
  | {
    filter: "month";
    month: string;
  };

export async function exportOwnReports(
  options: ReportExportFilter
) {
  const response = await api.get(
    "/api/reports/export/own",
    {
      params: options,
      responseType: "blob",
    }
  );

  return response.data;
}

export async function exportAllReports(
  options: ReportExportFilter
) {
  const response = await api.get(
    "/api/reports/export/all",
    {
      params: options,
      responseType: "blob",
    }
  );

  return response.data;
}