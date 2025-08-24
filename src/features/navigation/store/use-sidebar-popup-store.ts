import { ReactNode } from "react";
import { create } from "zustand";
import { SidebarItemId } from "../components/dashboard-sidebar";

type SidebarPopup = { id: SidebarItemId; content: ReactNode; duration: number };
type SidebarStore = {
  sidebarPopups: Array<SidebarPopup>;
  showSidebarPopup: (item: SidebarPopup) => void;
};

export const useSidebarPopupStore = create<SidebarStore>((set) => ({
  sidebarPopups: [],
  showSidebarPopup: (item) => {
    set((state) => ({ sidebarPopups: [...state.sidebarPopups, item] }));

    setTimeout(() => {
      set((state) => ({
        sidebarPopups: state.sidebarPopups.filter((p) => p.id !== item.id),
      }));
    }, item.duration);
  },
}));
