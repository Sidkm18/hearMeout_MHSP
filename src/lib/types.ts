export type UserRole = 'Student' | 'Counsellor' | 'Volunteer' | 'Admin';

export interface User {
  name: string;
  email: string;
  role: UserRole;
}
