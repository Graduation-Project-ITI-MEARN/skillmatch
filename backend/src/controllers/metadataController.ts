import { NextFunction, Request, Response } from "express";

export const CATEGORIES = [
   "Development",
   "Design",
   "Marketing",
   "Writing",
   "Translation",
   "Data Entry",
];

export const SKILLS = [
   "React",
   "Node.js",
   "Angular",
   "Vue.js",
   "TypeScript",
   "JavaScript",
   "Python",
   "Java",
   "C#",
   "PHP",
   "Ruby",
   "Go",
   "Swift",
   "Kotlin",
   "Flutter",
   "React Native",
   "HTML",
   "CSS",
   "SASS",
   "Tailwind CSS",
   "Bootstrap",
   "MongoDB",
   "PostgreSQL",
   "MySQL",
   "Redis",
   "Docker",
   "Kubernetes",
   "AWS",
   "Azure",
   "Google Cloud",
   "Figma",
   "Adobe XD",
   "Photoshop",
   "Illustrator",
   "Sketch",
   "InVision",
   "SEO",
   "Google Analytics",
   "Social Media Marketing",
   "Content Marketing",
   "Email Marketing",
   "Copywriting",
   "Technical Writing",
   "Content Writing",
   "Blog Writing",
   "Arabic Translation",
   "English Translation",
   "French Translation",
   "Data Analysis",
   "Excel",
   "Power BI",
   "Tableau",
];

const getCategories = (
   req: Request,
   res: Response,
   next: NextFunction
): void => {
   res.status(200).json({
      success: true,
      data: CATEGORIES,
   });
};

const getSkills = (req: Request, res: Response, next: NextFunction): void => {
   res.status(200).json({
      success: true,
      data: SKILLS,
   });
};

const isValidCategory = (category: string): boolean => {
   return CATEGORIES.includes(category);
};

const areValidSkills = (skills: string[]): boolean => {
   return skills.every((skill) => SKILLS.includes(skill));
};

export { getCategories, getSkills, isValidCategory, areValidSkills };
