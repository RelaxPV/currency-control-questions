/* This public address contains no credentials. The session token is short-lived. */
(() => {
  'use strict';
  const apiBase = 'https://currency-control-answers-251026.blue-kid-0598.chatgpt.site';

  const readJson = async response => {
    let result;
    try { result = await response.json(); }
    catch (_) { throw new Error('Сервис вернул непонятный ответ. Попробуйте отправить ещё раз.'); }
    if (!response.ok || !result || result.ok !== true) {
      throw new Error(typeof result?.error === 'string' ? result.error : 'Сервис пока не смог сохранить ответы. Попробуйте ещё раз.');
    }
    return result;
  };

  window.DENIS_QUESTIONS_CONFIG = {
    requireAll: true,
    async submit(payload) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 25000);
      try {
        const session = await readJson(await fetch(`${apiBase}/api/session`, {
          method: 'GET', mode: 'cors', credentials: 'omit', cache: 'no-store', signal: controller.signal
        }));
        if (typeof session.token !== 'string' || !session.token) {
          throw new Error('Не удалось подготовить отправку. Попробуйте ещё раз.');
        }
        const receipt = await readJson(await fetch(`${apiBase}/api/responses`, {
          method: 'POST', mode: 'cors', credentials: 'omit', signal: controller.signal,
          headers: { 'Content-Type': 'text/plain;charset=UTF-8', 'X-Form-Token': session.token },
          body: JSON.stringify(payload)
        }));
        if (typeof receipt.requestId !== 'string' || receipt.requestId !== payload.requestId) {
          throw new Error('Не удалось подтвердить сохранение этой анкеты. Повторите отправку.');
        }
        return receipt;
      } catch (error) {
        if (error.name === 'AbortError') throw new Error('Сервис не ответил вовремя. Попробуйте отправить ответы ещё раз.');
        if (error instanceof TypeError) throw new Error('Не удалось связаться с сервисом. Проверьте подключение к интернету.');
        throw error;
      } finally { clearTimeout(timeout); }
    }
  };
})();
