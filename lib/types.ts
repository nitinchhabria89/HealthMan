export type MealType = "breakfast" | "lunch" | "dinner" | "snack" | "drink";

export type Meal = {
  id: string;
  name: string;
  calories: number;
  type: MealType;
  time: string;
  photoAnalyzed?: boolean;
};

export type Severity = "mild" | "moderate" | "severe";

export type Symptom = {
  id: string;
  text: string;
  time: string;
  severity?: Severity;
  advice?: string;
};

export type Medicine = {
  id: string;
  name: string;
  dose: string;
  time: string;
};

export type Workout = {
  done: boolean;
  type: string;
  duration: string;
  intensity: string;
  notes: string;
  caloriesBurned?: number;
};

export type DayLog = {
  date: string; // YYYY-MM-DD
  meals: Meal[];
  symptoms: Symptom[];
  medicines: Medicine[];
  workout: Workout;
  mood: string;
  weight: number | null;
  water: number; // glasses
  notes: string;
  calorieTarget?: number;
};

export type Gender = "male" | "female";

export type Profile = {
  name: string;
  currentWeight: number;
  targetWeight: number;
  height: number;
  age: number;
  calorieTarget: number;
  gender: Gender;
};

export type Role = "owner" | "readonly";

export type SessionUser = {
  email: string;
  name: string;
  role: Role;
};

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export const EMPTY_WORKOUT: Workout = {
  done: false,
  type: "",
  duration: "",
  intensity: "",
  notes: "",
};

export function emptyDayLog(date: string): DayLog {
  return {
    date,
    meals: [],
    symptoms: [],
    medicines: [],
    workout: { ...EMPTY_WORKOUT },
    mood: "",
    weight: null,
    water: 0,
    notes: "",
  };
}
