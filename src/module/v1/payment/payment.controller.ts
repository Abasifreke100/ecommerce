import { Controller, Get, Query, Req, Res, UseGuards } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { ResponseMessage } from '../../../common/decorator/response.decorator';
import { DATA_FETCH } from '../../../common/constants/product.constants';
import { JwtAuthGuard } from '../auth/guard/jwt.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Roles } from '../../../common/decorator/roles.decorator';
import { RoleEnum } from '../../../common/constants/user.constants';
import { Request, Response } from 'express';
import { Public } from '../../../common/decorator/public.decorator'; // Import Express types

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @ResponseMessage(DATA_FETCH)
  @Get('user')
  async getUserPayments(@Query() queryData, @Req() req) {
    return await this.paymentService.getUserPayments(queryData, req.user);
  }

  @ResponseMessage(DATA_FETCH)
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN)
  async paginate(@Query() queryData) {
    return await this.paymentService.paginate(queryData);
  }

  @Public()
  @Get('success')
  async handleSuccess(@Req() req: Request, @Res() res: Response) {
    const paymentId = req.query.paymentId as string | undefined;
    const payerId = req.query.PayerID as string | undefined;

    if (!paymentId || !payerId) {
      // Handle the case where one or both query parameters are missing
      return res.status(400).send('Payment ID and Payer ID are required.');
    }

    try {
      // Execute the payment with the paymentId and PayerID
      const executePayment: any = await this.paymentService.executePayment(
        paymentId,
        payerId,
      );

      // Check the response to verify the payment was successful
      if (executePayment.state === 'approved') {
        // Payment was successful, you can perform further actions here
        return res.send(executePayment);
      } else {
        return res.send('Payment failed.');
      }
    } catch (error) {
      return res
        .status(500)
        .send('Error processing the payment: ' + error.message);
    }
  }

  @Public()
  @Get('cancel')
  async handleCancel() {
    return 'payment cancelled!!';
  }
}
