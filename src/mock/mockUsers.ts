export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: "admin" | "sdr";
}

export const mockUsers: User[] = [
  {
    id: "user-1",
    name: "Rafael Costa",
    email: "rafael@sdrflow.com",
    avatar: "RC",
    role: "admin",
  },
  {
    id: "user-2",
    name: "Maria Oliveira",
    email: "maria@sdrflow.com",
    avatar: "MO",
    role: "sdr",
  },
  {
    id: "user-3",
    name: "John Mitchell",
    email: "john@sdrflow.com",
    avatar: "JM",
    role: "sdr",
  },
];
