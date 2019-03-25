
<div align="center">
  <a href="https://github.com/VKCOM">
    <img width="100" height="100" src="https://avatars3.githubusercontent.com/u/1478241?s=200&v=4">
  </a>
  <br>
  <br>

  [![npm][npm]][npm-url]
  [![node][node]][node-url]
  [![deps][deps]][deps-url]

</div>


# vkui-connect-promise

Пакет для интеграции VK Apps-приложений с официальными клиентами VK для iOS, Android и Web с шиной событий на промисах.

Подробнее о промисах можно почитать тут:
- https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise 🇬🇧/🇷🇺
- http://learn.javascript.ru/promise 🇷🇺


## Подключение
```js
import connect from '@vkontakte/vkui-connect-promise';
```

## Пример использования
Теперь нет необходимости отдельно подписываться на обработку событий, а можно работать с событиями VK Connect как с нативными промисами, например так:
```js
// Отправляет событие клиенту
connect.send('VKWebAppInit', {})
  .then(data => handleResponse(data))
  .catch(error => handleError(error));
```

[npm]: https://img.shields.io/npm/v/@vkontakte/vkui-connect-promise.svg
[npm-url]: https://npmjs.com/package/@vkontakte/vkui-connect-promise

[node]: https://img.shields.io/node/v/@vkontakte/vkui-connect-promise.svg
[node-url]: https://nodejs.org

[deps]: https://img.shields.io/david/vkcom/vkui-connect-promise.svg
[deps-url]: https://david-dm.org/vkcom/vkui-connect-promise