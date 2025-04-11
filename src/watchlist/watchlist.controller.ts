import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Res,
  Req,
  UseGuards,
} from '@nestjs/common';
import { WatchlistService } from './watchlist.service';
import { CreateWatchlistDto } from './dto/create-watchlist.dto';
import { UserGuard } from 'src/guards/user-guard';

@Controller('watchlist')
export class WatchlistController {
  constructor(private readonly watchlistService: WatchlistService) {}

  @UseGuards(UserGuard)
  @Post('add')
  async create(
    @Body() createWatchlistDto: CreateWatchlistDto,
    @Res() res,
    @Req() req,
  ) {
    try {
      const result = await this.watchlistService.create(
        req.user,
        createWatchlistDto,
      );
      return res.status(201).json({
        success: true,
        message: 'Auction added to watchlist successfully',
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
  @Get('my-watchlist')
  async findAll(@Res() res, @Req() req) {
    try {
      const result = await this.watchlistService.findAll(req.user);
      return res.status(200).json({
        success: true,
        message: 'watchlists retrieved successfully',
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
  @Get('my-watchlist/:id')
  async findOne(@Param('id') id: string, @Res() res, @Req() req) {
    try {
      const result = await this.watchlistService.findOne(req.user, id);
      return res.status(200).json({
        success: true,
        message: 'watchlist retrieved successfully',
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

  @Delete('my-watchlist/:id')
  async remove(@Param('id') id: string, @Res() res, @Req() req) {
    try {
      await this.watchlistService.remove(req.user, id);
      return res.status(204).json();
    } catch (error) {
      console.log(error);
      return res.status(error.status || 500).json({
        success: false,
        message: error.message,
      });
    }
  }
}
