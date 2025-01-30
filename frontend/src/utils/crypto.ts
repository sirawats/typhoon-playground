import CryptoJS from 'crypto-js';

export const hashPassword = (password: string) => {
  const salt = CryptoJS.lib.WordArray.random(16).toString();
  const iterations = 100000;

  const key = CryptoJS.PBKDF2(password, salt, {
    keySize: 256 / 32,
    iterations: iterations,
    hasher: CryptoJS.algo.SHA256,
  });

  return {
    hashedPassword: key.toString(),
    salt: salt,
    iterations: iterations,
  };
};
