export interface User {
  _id: string;
  name: string;
  email: string;
  token: string;
  role: 'user' | 'admin';
}
