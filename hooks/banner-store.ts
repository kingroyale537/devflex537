import { create } from "zustand";

interface BannerData {
  show: boolean;
  bannerKey?: string;
  text: string;
  link?: string;
  linkText?: string;
  backgroundColor?: string;
  textColor?: string;
}

interface BannerStore {
  data: BannerData;
  setBanner: (data: Partial<BannerData>) => void;
  hideBanner: () => void;
}

const isBrowser = typeof window !== "undefined";

const hasBannerBeenDismissed = (bannerKey: string): boolean => {
  if (!isBrowser || !bannerKey) return false;

  const dismissedBanners = localStorage.getItem("dismissedBanners");
  if (!dismissedBanners) return false;

  try {
    const parsedDismissedBanners = JSON.parse(dismissedBanners);
    return parsedDismissedBanners.includes(bannerKey);
  } catch (error) {
    console.error("Error parsing dismissed banners from localStorage:", error);
    return false;
  }
};

const saveDismissedBanner = (bannerKey: string): void => {
  if (!isBrowser || !bannerKey) return;

  try {
    const dismissedBanners = localStorage.getItem("dismissedBanners");
    let parsedDismissedBanners: string[] = [];

    if (dismissedBanners) {
      parsedDismissedBanners = JSON.parse(dismissedBanners);
    }

    if (!parsedDismissedBanners.includes(bannerKey)) {
      parsedDismissedBanners.push(bannerKey);
      localStorage.setItem(
        "dismissedBanners",
        JSON.stringify(parsedDismissedBanners)
      );
    }
  } catch (error) {
    console.error("Error saving dismissed banner to localStorage:", error);
  }
};

export const useBannerStore = create<BannerStore>((set) => ({
  data: {
    show: false,
    text: "",
    link: "",
    linkText: "Learn More",
    bannerKey: "",
  },
  setBanner: (newData) => {
    if (newData.bannerKey && hasBannerBeenDismissed(newData.bannerKey)) {
      set((state) => ({
        data: {
          ...state.data,
          ...newData,
          show: false,
        },
      }));
    } else {
      set((state) => ({ data: { ...state.data, ...newData } }));
    }
  },
  hideBanner: () => {
    set((state) => {
      if (state.data.bannerKey) {
        saveDismissedBanner(state.data.bannerKey);
      }
      return { data: { ...state.data, show: false } };
    });
  },
}));
