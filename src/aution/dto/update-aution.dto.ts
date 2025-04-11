import { PartialType } from '@nestjs/mapped-types';
import { CreateAuctionDto } from './create-aution.dto';

export class UpdateAutionDto extends PartialType(CreateAuctionDto) {}
