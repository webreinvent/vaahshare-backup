export function isProd()
{
    return import.meta.env.VITE_APP_ENV === 'production';
}
