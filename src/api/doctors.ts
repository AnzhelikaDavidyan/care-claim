import type { Doctor, Specialty } from "../features/doctors/types"

export interface DoctorFilters {
    q?: string
    specialty?: Specialty | ''
}

/** GET /api/doctors with optional filters. Throws on any non-2xx response. */
export async function fetchDoctors(filters: DoctorFilters, signal?: AbortSignal): Promise<Doctor[]> {
    const params = new URLSearchParams();
    const q = filters.q?.trim();
    if (q) params.set('q', q);
    if (filters.specialty) params.set('specialty', filters.specialty);

    const query = params.toString()
    const url = query ? `/api/doctors?${query}` : '/api/doctors'
    const response = await fetch(url, { signal });
    if (!response.ok) {
        const body = await response.json().catch(() => null)
        throw new Error(body?.message ?? `Request failed with status ${response.status}`)
    }
    return response.json();
}
