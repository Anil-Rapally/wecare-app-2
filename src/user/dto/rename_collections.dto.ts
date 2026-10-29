import { IsInt, IsString, MaxLength, Min, MinLength } from 'class-validator';

export class RenameCollectionDto {
  @IsInt()
  @Min(1)
  id!: number;

  @IsString()
  @MinLength(2, { message: 'validation.collections_min' })
  @MaxLength(40, { message: 'validation.collections_max' })
  newname!: string;

}