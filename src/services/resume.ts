import api from "./api";

import type {
    ResumeProfile,
    ResumeCustomization,
    ResumeContent,
} from "../types/resume";


/* ================================================================
   PROFILE
================================================================ */

export async function getResumeProfile() {

    return api.get<{
        success: boolean;
        data: ResumeProfile | null;
    }>(
        "/api/resume/profile"
    );

}


export async function saveResumeProfile(
    data: ResumeContent
) {

    return api.put<{
        success: boolean;
        message: string;
        data: ResumeProfile;
    }>(
        "/api/resume/profile",
        data
    );

}


/* ================================================================
   CUSTOMIZATION
================================================================ */

export async function getResumeCustomization() {

    return api.get<{
        success: boolean;
        data: ResumeCustomization | null;
    }>(
        "/api/resume/customization"
    );

}


export async function createCustomizationFromProfile() {

    return api.post<{
        success: boolean;
        message: string;
        data: ResumeCustomization;
    }>(
        "/api/resume/customization/from-profile"
    );

}


export async function saveResumeCustomization(
    content: ResumeContent
) {

    return api.put<{
        success: boolean;
        message: string;
        data: ResumeCustomization;
    }>(
        "/api/resume/customization",
        content
    );

}


/* ================================================================
   PDF
================================================================ */

export async function downloadResumePdf() {

    return api.get(
        "/api/resume/download",
        {
            responseType: "blob",
        }
    );

}