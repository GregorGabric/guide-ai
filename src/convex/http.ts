import { httpRouter } from 'convex/server';
import { auth } from './auth';
import { chatHandler, chatStreamHandler } from './chat';

const http = httpRouter();
auth.addHttpRoutes(http);

http.route({
  path: '/chat-stream',
  method: 'POST',
  handler: chatStreamHandler,
});

http.route({
  path: '/chat',
  method: 'POST',
  handler: chatHandler,
});

export default http;
