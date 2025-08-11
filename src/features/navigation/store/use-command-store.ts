import { create } from "zustand";

export const useCommandStore = create<{
  commandOpen: boolean;
  setCommandOpen: (commandOpen: boolean) => void;
}>((set) => ({
  commandOpen: false,
  setCommandOpen: (commandOpen) => set({ commandOpen }),
}));
