using System;
using System.Security.Cryptography;
using Microsoft.AspNetCore.Cryptography.KeyDerivation;
 
namespace FullStackApp.Services
{
    public class PasswordService
    {
        public string HashPassword(string password)
        {
            // Generate a random salt
            byte[] salt = new byte[128 / 8];
            using (var rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(salt);
            }
 
            // Hash the password with the salt
            string hashedPassword = Convert.ToBase64String(KeyDerivation.Pbkdf2(
                password: password,
                salt: salt,
                prf: KeyDerivationPrf.HMACSHA512,
                iterationCount: 10000,
                numBytesRequested: 256 / 8));
 
            // Combine the salt and hashed password for storage
            return $"{Convert.ToBase64String(salt)}:{hashedPassword}";
        }
 
        public bool VerifyPassword(string storedHash, string password)
        {
            // Extract the salt and hash from the stored string
            var parts = storedHash.Split(':');
            if (parts.Length != 2)
                return false;
 
            var salt = Convert.FromBase64String(parts[0]);
            var storedPasswordHash = parts[1];
 
            // Hash the provided password with the extracted salt
            string computedHash = Convert.ToBase64String(KeyDerivation.Pbkdf2(
                password: password,
                salt: salt,
                prf: KeyDerivationPrf.HMACSHA512,
                iterationCount: 10000,
                numBytesRequested: 256 / 8));
 
            // Compare the computed hash with the stored hash
            return storedPasswordHash == computedHash;
        }
    }
}
