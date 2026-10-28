import { IsInt, IsString, Min, MinLength } from 'class-validator';

export class RenameCollectionDto {
  @IsInt()
  @Min(1)
  id!: number;

  @IsString()
  @MinLength(1)
  newname!: string;
  
}