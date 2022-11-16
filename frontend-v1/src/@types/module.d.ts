declare module '*.svg';
declare module '*.png';
declare module '*.gif';
declare module '*.less' {
  const classes: { [key: string]: string };
  export default classes;
}