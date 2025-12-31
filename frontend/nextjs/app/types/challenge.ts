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
  
  company?: string; 
  location?: string;
}
export interface Category {
  id: string;
  name: string;
}