import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class BankService {
  async findAll(country: string) {
    const response = await axios.get(
      `https://api.paystack.co/bank?country=${country}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      },
    );
    return response.data;
  }

  async resolveAccount(accountNumber: string, bankCode: string) {
    try {
      const response = await axios.get(
        `https://api.paystack.co/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        },
      );
      return response?.data?.data;
    } catch (error) {
      console.log('Error:', error.response?.data || error.message);
      throw new Error(
        error.response?.data?.message || 'Failed to resolve account',
      );
    }
  }
}
