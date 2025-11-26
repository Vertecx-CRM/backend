import { IsString, Length } from 'class-validator';
import { Match } from 'src/users/decorators/match.decorator';

export class ChangePasswordDto {
  @IsString({ message: 'La contrase�a actual debe ser texto.' })
  currentPassword: string;

  @IsString({ message: 'La nueva contrase�a debe ser texto.' })
  @Length(8, 100, { message: 'La nueva contrase�a debe tener al menos 8 caracteres.' })
  newPassword: string;

  @IsString({ message: 'La confirmaci�n debe ser texto.' })
  @Match('newPassword', { message: 'Las contrase�as no coinciden.' })
  confirmNewPassword: string;
}
