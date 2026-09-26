import cors from 'cors';
import express from 'express';
import { env } from './config/env.config.js';
import { isLiveSupabaseConfigured } from './config/supabase.config.js';
import { SERVICE_NAME } from './core/constants/app.constant.js';
import { Logger } from './core/logger/logger.js';
import { authMiddleware } from './core/middleware/auth.middleware.js';
import { errorHandler, notFoundHandler } from './core/middleware/error-handler.middleware.js';
import aiRoutes from './routes/ai.routes.js';
import contactLinksRoutes from './routes/contact-links.routes.js';
import contactsRoutes from './routes/contacts.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import demoRoutes from './routes/demo.routes.js';
import healthRoutes from './routes/health.routes.js';
import jobsRoutes from './routes/jobs.routes.js';
import tasksRoutes from './routes/tasks.routes.js';

const logger = new Logger('Server');
const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, _res, next) => {
    logger.log(`${req.method} ${req.originalUrl}`);
    next();
});

app.use('/api/health', healthRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/jobs', authMiddleware, jobsRoutes);
app.use('/api/tasks', authMiddleware, tasksRoutes);
app.use('/api/contacts', authMiddleware, contactsRoutes);
app.use('/api/contact-links', authMiddleware, contactLinksRoutes);
app.use('/api/dashboard', authMiddleware, dashboardRoutes);
app.use('/api/demo', authMiddleware, demoRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(env.PORT, () => {
    const mode = isLiveSupabaseConfigured ? 'Supabase PostgreSQL' : 'Local Sandbox';
    logger.log(`${SERVICE_NAME} listening on http://localhost:${env.PORT} [${mode}]`);
});

export default app;
