import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { OrdersService } from './orders.service';
import {
  ICompleteOrder,
  IDriverAcceptOrder,
  IDriverRejectOrder,
} from 'src/common/constants/order.constants';
import { DriverService } from '../driver/driver.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class OrderGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  constructor(
    private readonly orderService: OrdersService,
    private driverService: DriverService,
  ) {}

  afterInit(server: any): any {
    console.log('socket initialized');
  }

  handleConnection(client: any, ...args: any[]) {
    console.log('client connected');

    client.emit('message', 'Successfully connected to server');
  }

  handleDisconnect(client: any) {
    console.log('client disconnected');
  }

  @SubscribeMessage('completeOrder')
  async handleCompleteOrder(client: any, data: ICompleteOrder) {
    const { orderId } = data;

    const order = await this.orderService.getOrderById(orderId);

    console.log('order', order);

    if (order.driverId) {
      return;
    }

    let closestDrivers = await this.driverService.findNearbyDrivers(
      order.fromLatitude,
      order.fromLongitude,
    );

    closestDrivers = closestDrivers.filter(
      (driver) => !order.rejectedDriverIds.includes(driver._id),
    );

    console.log('closest-drivers', closestDrivers);

    console.log('completeOrder', data);
  }

  @SubscribeMessage('handleDriverRejectdOrder')
  async handleDriverRejectedOrder(client: any, data: IDriverRejectOrder) {
    const { orderId, driverId } = data;

    await this.orderService.updateOrder(orderId, {
      rejectedDriverIds: [driverId],
    });

    await this.handleCompleteOrder(client, { orderId });
    client.emit('driverRejectedOrderSuccess');
    console.log('handleDriverRejectedOrder', data);
  }

  @SubscribeMessage('handleDriverAcceptOrder')
  async handleDriverAcceptOrder(client: any, data: IDriverAcceptOrder) {
    const { driverId, orderId } = data;

    await this.orderService.assignDriverToOrder(driverId, orderId);

    client.emit('orderAssignedToDriver');
    console.log('handleDriverAcceptOrder', data);
  }
}
