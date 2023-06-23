import { Module, forwardRef } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from './schema/order.schema';
import { OrderGateway } from './order.gateway';
import { DriverModule } from '../driver/driver.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]),
    forwardRef(() => DriverModule),
    forwardRef(() => UserModule)
  ],
  controllers: [OrdersController],
  providers: [OrdersService, OrderGateway],
})
export class OrdersModule {}
