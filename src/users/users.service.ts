import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  private users = [];

  create(createUserDto: CreateUserDto) {
    const dto = new CreateUserDto(createUserDto);
    const errors = dto.validate();

    if (errors.length > 0) {
      return { success: false, message: 'Validation errors', errors };
    }

    const existingUser = this.users.find(
      (u) => u.documentNumber === dto.documentNumber
    );

    if (existingUser) {
      return {
        success: false,
        message: 'Document number already exists.',
        errors: ['The document number is already registered by another user.'],
      };
    }

    const newUser = {
      id: this.users.length + 1,
      ...dto,
      createdAt: new Date(),
    };

    this.users.push(newUser);

    return {
      success: true,
      message: 'User created successfully',
      data: newUser,
    };
  }

  findAll() {
    return this.users;
  }

  findOne(id: number) {
    const user = this.users.find((user) => user.id === id);
    return user || { success: false, message: `User with id not found ${id}` };
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    const userIndex = this.users.findIndex((u) => u.id === id);
    if (userIndex === -1) {
      return { success: false, message: `User with ID ${id} was not found.` };
    }

    const dto = new UpdateUserDto(updateUserDto);
    const errors = dto.validate();
    if (errors.length > 0) {
      return { success: false, message: 'Validation errors', errors };
    }

    // Validar duplicados
    if (dto.documentNumber) {
      const duplicateDoc = this.users.find(
        (u) => u.documentNumber === dto.documentNumber && u.id !== id
      );
      if (duplicateDoc) {
        return {
          success: false,
          message: 'Document number already exists.',
          errors: ['The document number is already registered by another user.'],
        };
      }
    }

    if (dto.email) {
      const duplicateEmail = this.users.find(
        (u) => u.email === dto.email && u.id !== id
      );
      if (duplicateEmail) {
        return {
          success: false,
          message: 'Email already exists.',
          errors: ['The email is already registered by another user.'],
        };
      }
    }

    const filteredDto = Object.fromEntries(
      Object.entries(dto).filter(([_, value]) => value !== undefined)
    );

    const updatedUser = {
      ...this.users[userIndex],
      ...filteredDto,
      updatedAt: new Date(),
    };

    this.users[userIndex] = updatedUser;

    return {
      success: true,
      message: `User with ID ${id} updated successfully.`,
      data: updatedUser,
    };
  }


  remove(id: number) {
    const index = this.users.findIndex((u) => u.id === id);

    if (index === -1) {
      return {
        success: false,
        message: `User with ID ${id} was not found.`,
      };
    }

    const deletedUser = this.users[index];

    this.users.splice(index, 1);

    return {
      success: true,
      message: `User with ID ${id} removed successfully.`,
      data: deletedUser,
    };
  }

}
