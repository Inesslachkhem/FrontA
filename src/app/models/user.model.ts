export enum UserType {
  Admin = 2,
  DirecteurCommercial = 0,
  ResponsablesStocks = 1,
}

export interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  type: UserType;
  createdAt: Date;
  updatedAt?: Date;
  lastLoginAt?: Date;
  isActive: boolean;
}

export interface CreateUserDto {
  nom: string;
  prenom: string;
  email: string;
  password: string;
  type: UserType;
}

export interface UpdateUserDto {
  nom: string;
  prenom: string;
  email: string;
  password?: string;
  type: UserType;
  isActive: boolean;
}

export interface SignInDto {
  email: string;
  password: string;
}

export interface SignInResponseDto {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  type: UserType;
  token: string;
  message: string;
}

export interface UserStatsDto {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  directeurCommercialCount: number;
  responsablesStocksCount: number;
}

export function getUserTypeDisplayName(type: UserType): string {
  switch (type) {
    case UserType.Admin:
      return 'Administrateur';
    case UserType.DirecteurCommercial:
      return 'Directeur Commercial';
    case UserType.ResponsablesStocks:
      return 'Responsable Stocks';
    default:
      return 'Inconnu';
  }
}
