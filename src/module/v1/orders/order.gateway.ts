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

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class OrderGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  constructor(private readonly orderService: OrdersService) {}

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
  handleCompleteOrder(client: any, data: any) {
    console.log('completeOrder', data);
    client.emit('orderCompleteUpdate');
  }

  @SubscribeMessage('assignDriverToOrder')
  async handleAssignDriverToOrder(client: any, data: any) {
    console.log('assignDriverToOrder', data);
    const { driverId, orderId } = data;

    await this.orderService.assignDriverToOrder(driverId, orderId);

    client.emit('orderAssignedToDriver');
  }
}
