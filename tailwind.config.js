/** @type {import('tailwindcss').Config} */
export const content = [
  "./pages/**/*.{js,ts,jsx,tsx}", // Inclua suas páginas
  "./components/**/*.{js,ts,jsx,tsx}", // Inclua seus componentes
];
export const theme = {
  extend: {},
};
export const plugins = [require("daisyui")];
