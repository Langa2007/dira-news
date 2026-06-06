import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function loadDatabaseEnv() {
  dotenv.config({ path: path.resolve(__dirname, '../.env'), quiet: true });
  dotenv.config({ path: path.resolve(__dirname, '../../.env'), quiet: true });
}

function readDatabaseConfig() {
  loadDatabaseEnv();

  return {
    local: {
      host: process.env.LOCAL_DB_HOST || 'localhost',
      port: Number(process.env.LOCAL_DB_PORT || 5432),
      database: process.env.LOCAL_DB_NAME || 'dira news',
      user: process.env.LOCAL_DB_USER || 'postgres',
      password: process.env.LOCAL_DB_PASSWORD || '5638',
      schema: process.env.LOCAL_DB_SCHEMA || 'public'
    },
    neon: {
      url: process.env.DATABASE_URL_NEON || process.env.NEON_DATABASE_URL || ''
    },
    databaseUrl: {
      url: process.env.DATABASE_URL || ''
    }
  };
}

const targetAliases = {
  auto: 'auto',
  default: 'auto',
  local: 'local',
  neon: 'neon',
  remote: 'neon',
  render: 'neon',
  production: 'neon',
  direct: 'databaseUrl',
  database_url: 'databaseUrl',
  databaseurl: 'databaseUrl',
  url: 'databaseUrl'
};

function normalizeTarget(target = 'auto') {
  const key = String(target || 'auto').trim().toLowerCase();
  return targetAliases[key] || key;
}

function resolveDatabaseTarget(target = process.env.DB_TARGET || 'auto') {
  const normalized = normalizeTarget(target);

  if (normalized !== 'auto') {
    return normalized;
  }

  const config = readDatabaseConfig();

  if (config.neon.url) {
    return 'neon';
  }

  if (config.databaseUrl.url) {
    return 'databaseUrl';
  }

  if (process.env.NODE_ENV === 'production') {
    return 'neon';
  }

  return 'local';
}

function getDatabaseConfig(target = process.env.DB_TARGET || 'auto') {
  const resolved = resolveDatabaseTarget(target);
  const config = readDatabaseConfig();

  if (!config[resolved]) {
    throw new Error(`Unknown database target: ${target}`);
  }

  return config[resolved];
}

function localConnectionArgs(config = readDatabaseConfig().local) {
  return ['-h', config.host, '-p', String(config.port), '-U', config.user, '-d', config.database];
}

function localConnectionEnv(config = readDatabaseConfig().local) {
  return {
    ...process.env,
    PGPASSWORD: config.password
  };
}

function localDatabaseUrl(config = readDatabaseConfig().local) {
  const user = encodeURIComponent(config.user);
  const password = encodeURIComponent(config.password);
  const schema = encodeURIComponent(config.schema || 'public');

  return `postgresql://${user}:${password}@${config.host}:${config.port}/${config.database}?schema=${schema}`;
}

function backendDatabaseUrl(target = process.env.DB_TARGET || 'auto') {
  const resolved = resolveDatabaseTarget(target);
  const config = readDatabaseConfig();

  if (resolved === 'local') {
    return localDatabaseUrl(config.local);
  }

  if (resolved === 'neon') {
    const url = config.neon.url || config.databaseUrl.url;

    if (!url) {
      throw new Error('Missing Neon database URL. Set DATABASE_URL_NEON or DATABASE_URL before starting the backend.');
    }

    return url;
  }

  if (resolved === 'databaseUrl') {
    if (!config.databaseUrl.url) {
      throw new Error('Missing DATABASE_URL.');
    }

    return config.databaseUrl.url;
  }

  throw new Error(`Unknown database target: ${target}`);
}

function applyDatabaseConfig(target = process.env.DB_TARGET || 'auto') {
  const resolved = resolveDatabaseTarget(target);
  const url = backendDatabaseUrl(resolved);

  process.env.DATABASE_URL = url;
  process.env.ACTIVE_DATABASE_TARGET = resolved;

  return {
    target: resolved,
    url
  };
}

function activeDatabaseTarget(target = process.env.DB_TARGET || 'auto') {
  return resolveDatabaseTarget(target);
}

const databaseConfig = new Proxy(
  {},
  {
    get(_target, property) {
      if (property === 'toJSON') {
        return readDatabaseConfig;
      }

      return readDatabaseConfig()[property];
    },
    ownKeys() {
      return Reflect.ownKeys(readDatabaseConfig());
    },
    getOwnPropertyDescriptor(_target, property) {
      if (property in readDatabaseConfig()) {
        return {
          enumerable: true,
          configurable: true
        };
      }

      return undefined;
    }
  }
);

export {
  activeDatabaseTarget,
  applyDatabaseConfig,
  backendDatabaseUrl,
  databaseConfig,
  getDatabaseConfig,
  localConnectionArgs,
  localConnectionEnv,
  localDatabaseUrl,
  readDatabaseConfig
};
