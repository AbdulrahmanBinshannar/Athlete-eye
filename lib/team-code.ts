export function generateTeamCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = 'AE-';
  
  // 4 mixed characters
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  result += '-';
  
  // 2 letters suffix
  for (let i = 0; i < 2; i++) {
    result += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  
  return result;
}
