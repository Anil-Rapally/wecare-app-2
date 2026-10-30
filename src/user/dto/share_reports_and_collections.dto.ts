import { IsNumber, IsOptional, IsString, ValidateIf } from "class-validator";


export class ShareReportsAndCollections{

    @IsNumber()
    @IsOptional()
    report_id:number;

    @IsNumber()
    @IsOptional()
    collection_id:number;

    @IsOptional()
    @IsString()
    permission:String;

    @IsOptional()
    @ValidateIf((o) => !o.from_date)
    @ValidateIf((o) => !o.to_date)
    extendTo:Date;

    @IsOptional()
    @ValidateIf((o) => !o.extendTo)
    from_date:Date;

    @IsOptional()
    @ValidateIf((o) => !o.extendTo)
    to_date:Date;


}