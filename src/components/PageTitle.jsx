import { useEffect } from "react";

const APP_NAME = "Team Report Tracking";

export default function PageTitle({ title }) {
    useEffect(() => {
        document.title = `${title} | ${APP_NAME}`;
    }, [title]);

    return null;
}