// src/utils/helpers.ts
export const cn = (...classes: (string | boolean | undefined)[]) => {
  return classes.filter(Boolean).join(" ");
};

export const menuTransition = "transition-all duration-200 ease-in-out";
