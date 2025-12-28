export interface Challenge {
  id: string;
  title: string;
  company: string;
  location: string;
  deadline: string;
  category: "Coding" | "Accounting" | "Design" | string;
  type: "Jobs" | "Prizes" | "All";
  prize: number;
  salary?: number;
  difficulty: "Easy" | "Medium" | "Hard" | string;
}

// إذا كان لديك أنواع بيانات أخرى للميتا داتا
export interface Category {
  id: string;
  name: string;
}