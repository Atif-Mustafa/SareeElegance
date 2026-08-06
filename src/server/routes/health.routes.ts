import { Router, Request, Response } from 'express';

export const healthRouter = Router();

healthRouter.get('/health', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
     .status(200)
     .json({
       success: true,
       data: {
         status: 'ok',
         service: 'saree-elegance-api',
       },
       meta: {
         timestamp: new Date().toISOString(),
         requestId: req.requestId || 'unknown',
       },
     });
});
