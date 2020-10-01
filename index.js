
// import base
const { Module } = require('@dashup/module');

// import fields
const ChatPage = require('./pages/chat');

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
  }
}

// create new
module.exports = new ChatModule();
