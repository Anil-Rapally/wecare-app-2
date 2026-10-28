import { ApiProperty } from "@nestjs/swagger";
import {
    ArrayNotEmpty,
    IsArray,
    IsInt,
    Min
} from "class-validator"


export class RemoveReportsFromCollectionDto {

    @ApiProperty({
        name:'report_ids',
        type: Number,
        example: '[1]',
        description:'remove one or more reports from collection'
    })
    @IsArray()
    @ArrayNotEmpty()
    @IsInt({ each: true })
    @Min(1, { each: true })
    report_ids!: number[];
}
