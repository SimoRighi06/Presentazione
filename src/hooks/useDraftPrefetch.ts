import { useEffect } from "react";
import { type AppConfig } from "../types/config";

export function useDraftPrefetch(config: AppConfig, draftUrl: string, siteParam: string) {
  useEffect(() => {
    if (!config.navItems || config.navItems.length === 0) return;

    const currentIndex = config.navItems.findIndex(
      (item) => item.draftUrl === draftUrl || item.id === draftUrl,
    );

    if (currentIndex === -1) return;

    const indicesToPrefetch = [currentIndex + 1, currentIndex + 2].filter(
      (i) => i < config.navItems.length,
    );

    const prefetchImage = (targetDraftUrl: string) => {
      if (!targetDraftUrl || targetDraftUrl.startsWith("http")) return;
      const url = `/bozze-proxy/${siteParam}/images/${targetDraftUrl}.jpg`;

      const img = new Image();
      img.src = url;
      img.loading = "eager";
    };

    const schedulePrefetch = () => {
      const win = window as Window &
        typeof globalThis & {
          requestIdleCallback?: (cb: IdleRequestCallback) => number;
        };

      if (win.requestIdleCallback) {
        win.requestIdleCallback(() => {
          indicesToPrefetch.forEach((i) => {
            const item = config.navItems[i];
            if (item?.draftUrl) prefetchImage(item.draftUrl);
          });
        });
      } else {
        setTimeout(() => {
          indicesToPrefetch.forEach((i) => {
            const item = config.navItems[i];
            if (item?.draftUrl) prefetchImage(item.draftUrl);
          });
        }, 500);
      }
    };

    schedulePrefetch();
  }, [draftUrl, siteParam, config.navItems]);
}
