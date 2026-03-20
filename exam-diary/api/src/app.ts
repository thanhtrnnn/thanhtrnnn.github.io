import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import yaml from 'yaml';
import fs from 'fs';
import path from 'path';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middleware/error';

const app: Application = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger setup
try {
  const candidatePaths = [
    path.join(__dirname, 'docs', 'openapi.yaml'),
    path.join(process.cwd(), 'src', 'docs', 'openapi.yaml')
  ];

  const swaggerPath = candidatePaths.find((item) => fs.existsSync(item));
  if (!swaggerPath) {
    throw new Error('openapi.yaml not found');
  }

  const swaggerDocument = yaml.parse(fs.readFileSync(swaggerPath, 'utf8'));
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} catch {
  console.log('Swagger document not found or invalid');
}

// Routes
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api', routes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
