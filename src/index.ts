import connect from '@vkontakte/vk-connect';

const { sendPromise, ...vkConnect } = connect;

/**
 * Interface of VK Connect Promise. Use `sendPromise` in latest version of
 * `@vkontakte/vk-connect` instead
 *
 * @deprecated
 */
const vkConnectPromise = {
  ...vkConnect,
  send: sendPromise
};

/**
 * Type of VK Connect Promise
 */
export type VKConnectPromise = typeof vkConnectPromise;

export default vkConnectPromise;
