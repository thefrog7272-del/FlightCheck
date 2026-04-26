// Offline data access for MSFS addon
declare global {
  interface Window {
    __ADDON_OFFLINE_DATA__?: {
      planes?: Array<{
        id: string;
        plane_id: string;
        name: string;
        manufacturer: string;
        image: string;
        type: string;
        sim?: string | null;
        sort_order?: number | null;
        author?: string | null;
        author_weblink?: string | null;
        ability_variant?: string | null;
        addon_developer_variant?: string | null;
      }>;
      checklists?: Array<{
        id: string;
        plane_id: string;
        category: string;
        phases: string;
      }>;
    };
  }
}

export function getOfflinePlanes() {
  return window.__ADDON_OFFLINE_DATA__?.planes ?? null;
}

export function getOfflineChecklists() {
  return window.__ADDON_OFFLINE_DATA__?.checklists ?? null;
}

export function hasOfflineData() {
  const data = window.__ADDON_OFFLINE_DATA__;
  return !!(data?.planes?.length && data?.checklists?.length);
}
