/* Public same-origin API configuration. Authentication uses an HttpOnly cookie. */
(() => {
  'use strict';
  const basePath = '/denis/';
  const request = async (path, body) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    try {
      const response = await fetch(basePath + path, {
        method: 'POST', credentials: 'same-origin', cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body), signal: controller.signal
      });
      let result;
      try { result = await response.json(); }
      catch (_) { throw new Error('Сервис вернул непонятный ответ. Попробуйте ещё раз.'); }
      if (!response.ok || !result || result.ok !== true) {
        const error = new Error(typeof result?.error === 'string' ? result.error : 'Не удалось сохранить ответ. Попробуйте ещё раз.');
        error.status = response.status;
        error.code = result?.code;
        error.details = result;
        throw error;
      }
      return result;
    } catch (error) {
      if (error.name === 'AbortError') throw new Error('Сервис не ответил вовремя. Попробуйте ещё раз.');
      if (error instanceof TypeError) throw new Error('Нет связи с сервером. Проверьте подключение к интернету.');
      throw error;
    } finally { clearTimeout(timeout); }
  };
  window.DENIS_QUESTIONS_CONFIG = {
    basePath,
    createSession: () => request('api/session', {}),
    saveAnswer: (number, answer) => request(`api/answers/${number}`, answer),
    complete: () => request('api/complete', {})
  };
})();
