<div align="center">
  <a href="https://github.com/VKCOM">
    <img width="100" height="100" src="https://avatars3.githubusercontent.com/u/1478241?s=200&v=4">
  </a>
  <br>
  <br>

[![npm][npm]][npm-url]
[![deps][deps]][deps-url]

[npm]: https://img.shields.io/npm/v/@vkontakte/vk-connect.svg
[npm-url]: https://npmjs.com/package/@vkontakte/vk-connect
[deps]: https://img.shields.io/david/vkcom/vk-connect.svg
[deps-url]: https://david-dm.org/vkcom/vk-connect

</div>

# VK Connect Promise

A package for integrating VK Mini Apps with official VK clients for iOS, Android and Web with events based on promises.

## ⛔️ DEPRECATED

The package has been deprecated in favor of the `sendPromise` method in [VK Connect](https://github.com/vkcom/vk-connect)

## Usage

```js
import vkConnectPromise from '@vkontakte/vk-connect-promise';

// Sends event to client
vkConnectPromise
  .send('VKWebAppGetEmail')
  .then(data => {
    // Handling received data
    console.log(data.email);
  })
  .catch(error => {
    // Handling an error
  });
```

For use in a browser, include the file [`dist/index.umd.js`](http://unpkg.com/@vkontakte/vk-connect-promise/dist/index.umd.js) and use as follows

```html
<script src="index.umd.js"></script>

<script>
  // Sends event to client
  window.vkConnectPromise
    .send('VKWebAppGetEmail')
    .then(data => {
      // Handling received data
      console.log(data.email);
    })
    .catch(error => {
      // Handling an error
    });
</script>
```
