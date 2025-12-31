export interface Challenge {
  _id: string; // MongoDB يستخدم _id
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  category: string;
  deadline: string;
  type: "job" | "prize";
  prizeAmount?: number;
  salary?: number;
  // بما إن الموديل فيه creatorId، هنفترض إن الـ API بيعمل Populate لبيانات الشركة
  company?: string; 
  location?: string;
}
// إذا كان لديك أنواع بيانات أخرى للميتا داتا
export interface Category {
  id: string;
  name: string;
}