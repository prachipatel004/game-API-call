// src/Store/BannerStore.js
import { create } from 'zustand';

const useBannerStore = create((set) => ({
  banners: [],
  setBanners: (data) => set({ banners: data }),
}));

export default useBannerStore;
