export const calculateSkillLevel = (
  avgScore: number,
  count: number
): "Beginner" | "Intermediate" | "Advanced" => {
  if (count >= 3 && avgScore >= 85) return "Advanced";
  if (count >= 1 && avgScore >= 65) return "Intermediate";
  return "Beginner";
};
