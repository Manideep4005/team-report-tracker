import api from "./api";

export async function getLoginPreview() {
    const { data } =
        await api.get("/api/dashboard/preview");

    return data;
}