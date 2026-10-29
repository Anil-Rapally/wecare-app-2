import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsNotEmpty, IsOptional, IsString, Matches, MaxLength, MinLength } from "class-validator";

export class CreateCollectionDto {
    @ApiPropertyOptional({
        name: 'collection_name',
        type: 'string',
        example: 'X-ray',
        description: ' New collection name'
    })
    @IsNotEmpty()
    @Transform(({ value }) =>
        value === '' ? undefined : value
    )
    @IsString({
        message:
            'validation.NEW_COLLECTION_NAME_STRING',
    })
    @MinLength(2, {
        message:
            'validation.NEW_COLLECTION_NAME_MIN',
    })
    @MaxLength(40, {
        message:
            'validation.NEW_COLLECTION_NAME_MAX',
    })
    @Matches(/[a-zA-Z]/, {
        message:
            'validation.NEW_COLLECTION_NAME_TEXT',
    })
    collection_name: string;


    
}