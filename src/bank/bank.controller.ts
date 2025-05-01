import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    Res,
  } from '@nestjs/common';
  import { BankService } from './bank.service';
  import { Response } from 'express';
  
  @Controller('bank')
  export class BankController {
    constructor(private readonly bankService: BankService) {}
  
    @Get('all')
    async findAll(@Query("country") country: string, @Res() res: Response) {
      try {
        const banks = await this.bankService.findAll(country);
        return res.status(200).json({
          success: true,
          message: 'bank lists retrieved successfully',
          data: banks,
        });
      } catch (error) {
        console.log(error);
        return res.status(error.status || 500).json({
          success: false,
          message: error.message,
        });
      }
    }
  
    @Get('resolve-account')
    async findOne(
      @Query('account_number') accountNumber: string,
      @Query('bank_code') bankCode: string,
      @Res() res:Response
    ) {
      try {
        const result = await this.bankService.resolveAccount(
          accountNumber,
          bankCode,
        );
  
        return res.status(200).json({
          success: true,
          message: 'bank account resolved successfully',
          data: result,
        });
      } catch (error) {
        console.log(error)
        return res.status(error.status || 500).json({
          success: false,
          message: error.message,
        });
      }
    }
  }
  