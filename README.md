# vkui-connect-promise

Пакет для интеграции VK Apps-приложений с официальными клиентами VK для iOS, Android и Web с шиной событий на промисах.

## Подключение
```js
import connect from '@vkontakte/vkui-connect';
```

## Пример использования
Теперь нет необходимости отдельно подписываться на обработку событий, а можно работать с событиями VK Connect как с нативными промисами, например так:
```js
// Отправляет событие клиенту
connect.send('VKWebAppInit', {})
  .then(data => handleResponse(data))
  .catch(error => handleError(error));
```