import { httpRouter } from 'convex/server';
import { chatHandler } from './chat';

const http = httpRouter();

http.route({
  path: '/api/chat',
  method: 'POST',
  handler: chatHandler,
});

export default http;
