export type UserRole = 'Student' | 'Counsellor' | 'Volunteer' | 'Admin';

export interface User {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
}
