import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MinLength,
  MaxLength,
  ArrayMinSize,
  IsISO8601,
} from 'class-validator';

export class BidDto {
  @IsNumber()
  @IsPositive()
  amount: number;
}

export class CreateAuctionDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  productName: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(1000)
  description: string;

  @IsNotEmpty()
  @IsISO8601()
  startDate: string;

  @IsNotEmpty()
  @IsISO8601()
  endDate: string;

  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  images: string[];

  @IsNumber()
  @IsPositive()
  @IsOptional()
  startingPrice: number = 0;
}

export class PlaceBidDto {
  @IsNumber()
  @IsPositive()
  amount: number;
}
