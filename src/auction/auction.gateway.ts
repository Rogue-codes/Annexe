// auctions.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway(3002, {
  cors: {
    origin: '*', // Configure according to your security needs
  },
})
export class AuctionsGateway {
  @WebSocketServer()
  server: Server;

  // Method to broadcast bid updates
  emitBidUpdate(auctionId: string, bid: any) {
    // this.server.emit(`auction:${auctionId}:bid`, bid);
    this.server.emit(`new bid`, bid);
  }

  // Allow clients to join auction-specific rooms
  @SubscribeMessage('joinAuction')
  handleJoinAuction(client: any, auctionId: string) {
    client.join(`auction:${auctionId}`);
    return { event: 'joinedAuction', data: auctionId };
  }

  // Allow clients to leave auction-specific rooms
  @SubscribeMessage('leaveAuction')
  handleLeaveAuction(client: any, auctionId: string) {
    client.leave(`auction:${auctionId}`);
    return { event: 'leftAuction', data: auctionId };
  }
}
