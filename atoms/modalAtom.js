import { atom } from "recoil";

export const modalState = atom({
  key: "modalState",
  default: false,
});
export const modalEditState = atom({
  key: "modalEditState",
  default: false,
});

export const postIdState = atom({
  key: "postIdState",
  default: "",
});
