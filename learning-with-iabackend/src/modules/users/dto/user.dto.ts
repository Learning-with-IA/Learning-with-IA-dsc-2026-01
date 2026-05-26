export class CreateUserDto {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export class UpdateUserDto {
  name?: string;
  email?: string;
  password?: string;
  phone?: string;
  isActive?: boolean;
}
