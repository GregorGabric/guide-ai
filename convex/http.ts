import { httpRouter } from 'convex/server';
import { chatStreamHandler } from './chat';

const http = httpRouter();

http.route({
  path: '/chat-stream',
  method: 'POST',
  handler: chatStreamHandler,
});

export default http;
