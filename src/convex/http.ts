import { httpRouter } from 'convex/server';
import { chatHandler, chatStreamHandler } from './chat';

const http = httpRouter();

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
