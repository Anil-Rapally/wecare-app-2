import 'reflect-metadata';

import dotenv from 'dotenv';
import { DataSource } from 'typeorm';

import { databaseOptions } from '../common/config/config';

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

export default new DataSource(databaseOptions());