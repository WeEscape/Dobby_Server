export const sleep = (sec: number) => {
  return new Promise(r => setTimeout(r, sec * 1000));
};
