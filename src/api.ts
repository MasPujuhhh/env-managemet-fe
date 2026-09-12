import { client } from './services/api/client';

export { client };
export { authApi } from './services/api/auth.api';
export { repositoryApi } from './services/api/repository.api';
export { secretApi } from './services/api/secret.api';
export { apiKeyApi } from './services/api/api-key.api';

export const api = client;
