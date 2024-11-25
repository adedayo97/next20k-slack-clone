import { NextApiRequest } from 'next';
import { Server as NetServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import { SockerIoApiResponse } from '@/types/app';

const initializeSocketServer = (httpServer: NetServer): SocketServer => {
  const io = new SocketServer(httpServer, {
    path: '/api/web-socket/io', // Custom path for Socket.IO
    cors: {
      origin: '*', // Adjust as needed for your application
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

const handler = async (req: NextApiRequest, res: SockerIoApiResponse) => {
  if (!res.socket.server.io) {
    console.log('Initializing new Socket.IO server...');
    const io = initializeSocketServer(res.socket.server as unknown as NetServer);
    res.socket.server.io = io;
  } else {
    console.log('Socket.IO server already initialized.');
  }

  res.end();
};

export default handler;
