
import {
  IsArray,
  IsInt,
  ArrayNotEmpty,
  Min,
} from 'class-validator';

export class EditCollectionsDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  @Min(1, { each: true })
  ids!: number[];
}
