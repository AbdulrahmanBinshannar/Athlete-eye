export function generateTeamCode() {
  // Generate a random 5-digit number (10001 - 99999)
  const code = Math.floor(10001 + Math.random() * 89998).toString();
  return code;
}
