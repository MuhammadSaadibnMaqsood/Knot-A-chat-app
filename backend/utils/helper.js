export const checkEmail = (email) => {
  return email.includes("@gmail.com");
};

export const checkPassword = (password) => {
  return password.length >= 8 && /[!@#$%^&*()]/.test(password);
};