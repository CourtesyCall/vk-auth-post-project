export enum Role {
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR',
  USER = 'USER',
}


export const RoleHierarchy = {
  [Role.ADMIN]: 3,
  [Role.MODERATOR]: 2,
  [Role.USER]: 1,
};