// export const verifyEmail = (email: string) => {
//   const emailRegex = /^\w+\.22u\w{5}@btech\.nitdgp\.ac\.in$/;

//   if (!emailRegex.test(email) && email !== process.env.ADMIN_EMAIL) {
//     return false;
//   }
//   return true;
// };

//temporary: allow Gmail for testing
export const verifyEmail = (email: string) => {
  const isNIT = /^\w+\.22u\w{5}@btech\.nitdgp\.ac\.in$/.test(email);
  const isAdmin = email === process.env.ADMIN_EMAIL;

  // TEMPORARY: allow Gmail for testing
  const isDevUser = email.endsWith("@gmail.com");

  return isNIT || isAdmin || isDevUser;
};
