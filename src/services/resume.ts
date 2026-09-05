import api from "./api";

import type {
    ResumeProfile,
    ResumeCustomization,
    ResumeProfileContent,
    ResumeCustomizationContent,
} from "../types/resume";


/* ================================================================
   PROFILE
================================================================ */

/**
 * Get the user's master resume profile.
 */
export async function getResumeProfile() {

    return api.get<{
        success: boolean;
        data: ResumeProfile | null;
    }>(
        "/api/resume/profile"
    );

}


/**
 * Save/update the user's master resume profile.
 *
 * This contains:
 * - Personal/header information
 * - Master sections[]
 */
export async function saveResumeProfile(
    data: ResumeProfileContent
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

/**
 * Get the user's independent resume customization.
 */
export async function getResumeCustomization() {

    return api.get<{
        success: boolean;
        data: ResumeCustomization | null;
    }>(
        "/api/resume/customization"
    );

}


/**
 * Create a customization by copying the current
 * master profile.
 *
 * After this operation the customization is independent
 * from the master profile.
 */
export async function createCustomizationFromProfile() {

    return api.post<{
        success: boolean;
        message: string;
        data: ResumeCustomization;
    }>(
        "/api/resume/customization/from-profile"
    );

}


/**
 * Save/update the independent customization.
 *
 * This contains:
 * - Personal/header information
 * - Customized sections[]
 */
export async function saveResumeCustomization(
    content: ResumeCustomizationContent
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

/**
 * Download the currently active resume as PDF.
 *
 * Backend decides whether to use:
 * - customization content
 * - or master profile content
 */
export async function downloadResumePdf() {

    return api.get(
        "/api/resume/download",
        {
            responseType: "blob",
        }
    );

}