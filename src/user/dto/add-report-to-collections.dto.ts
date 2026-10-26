import { ApiProperty } from "@nestjs/swagger";
import {
    ArrayNotEmpty,
    IsArray,
    IsInt,
    Min
} from "class-validator"


export class AddReportToCollectionsDto {

    @ApiProperty({
        name:'collection_ids',
        type: Number,
        example: '[1]',
        description:' Add a report to one or more collections'
    })
    @IsArray()
    @ArrayNotEmpty()
    @IsInt({ each: true })
    @Min(1, { each: true })
    collection_ids!: number[];
}
