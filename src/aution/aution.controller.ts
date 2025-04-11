import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Res,
} from '@nestjs/common';
import { AutionService } from './aution.service';
import { BidDto, CreateAuctionDto } from './dto/create-aution.dto';
import { UpdateAutionDto } from './dto/update-aution.dto';
import { UserGuard } from 'src/guards/user-guard';

@Controller('auction')
export class AutionController {
  constructor(private readonly autionService: AutionService) {}

  @UseGuards(UserGuard)
  @Post('create')
  async create(
    @Body() createAutionDto: CreateAuctionDto,
    @Req() req,
    @Res() res,
  ) {
    try {
      const result = await this.autionService.create(req.user, createAutionDto);
      return res.status(201).json({
        success: true,
        message: 'Auction created successfully',
        data: result,
      });
    } catch (error) {
      console.log(error);
      return res.status(error.status || 500).json({
        success: false,
        message: error.message,
      });
    }
  }

  @Post('sub')
  async sub(@Req() req, @Res() res) {
    try {
      const result = await this.autionService.callSub();
      return res.status(201).json({
        success: true,
        message: 'subscription created successfully',
        data: result,
      });
    } catch (error) {
      console.log(error);
      return res.status(error.status || 500).json({
        success: false,
        message: error.message,
      });
    }
  }

  @Get('all')
  async findAll(@Res() res) {
    try {
      const result = await this.autionService.findAll();
      return res.status(200).json({
        success: true,
        message: 'Auctions retrieved successfully',
        data: result,
      });
    } catch (error) {
      console.log(error);
      return res.status(error.status || 500).json({
        success: false,
        message: error.message,
      });
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Res() res) {
    try {
      const result = await this.autionService.findOne(id);
      return res.status(200).json({
        success: true,
        message: 'Auction retrieved successfully',
        data: result,
      });
    } catch (error) {
      console.log(error);
      return res.status(error.status || 500).json({
        success: false,
        message: error.message,
      });
    }
  }

  @UseGuards(UserGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateAutionDto: UpdateAutionDto,
    @Res() res,
    @Req() req,
  ) {
    try {
      const result = await this.autionService.update(
        req.user,
        id,
        updateAutionDto,
      );
      return res.status(200).json({
        success: true,
        message: 'Auction updated successfully',
        data: result,
      });
    } catch (error) {
      console.log(error);
      return res.status(error.status || 500).json({
        success: false,
        message: error.message,
      });
    }
  }

  @UseGuards(UserGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @Res() res, @Req() req) {
    try {
      const result = await this.autionService.remove(req.user, id);
      return res.status(204).json({
        success: true,
        message: result,
      });
    } catch (error) {
      console.log(error);
      return res.status(error.status || 500).json({
        success: false,
        message: error.message,
      });
    }
  }

  @UseGuards(UserGuard)
  @Post(':id')
  async SubmitBid(
    @Param('id') id: string,
    @Body() bidDto: BidDto,
    @Req() req,
    @Res() res,
  ) {
    try {
      const result = await this.autionService.submitBid(req.user, id, bidDto);
      return res.status(201).json({
        success: true,
        message: 'Bid submitted successfully',
        data: result,
      });
    } catch (error) {
      console.log(error);
      return res.status(error.status || 500).json({
        success: false,
        message: error.message,
      });
    }
  }
}
