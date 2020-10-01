
// import base
const { Module } = require('@dashup/module');

// import fields
const ChatPage    = require('./pages/chat');
const ChannelPage = require('./pages/channel');

/**
 * export module
 */
class ChatModule extends Module {
  
  /**
   * registers dashup structs
   *
   * @param {*} register 
   */
  register(fn) {
    // register sms action
    fn('page', ChatPage);
    fn('page', ChannelPage);
  }
}

// create new
module.exports = new ChatModule();
