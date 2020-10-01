
// import page interface
import { Struct } from '@dashup/module';

/**
 * build address helper
 */
export default class ChatPage extends Struct {

  /**
   * returns page type
   */
  get type() {
    // return page type label
    return 'chat';
  }

  /**
   * returns page type
   */
  get icon() {
    // return page type label
    return 'fa fa-comments';
  }

  /**
   * returns page type
   */
  get title() {
    // return page type label
    return 'Chat Page';
  }

  /**
   * returns page data
   */
  get data() {
    // return page data
    return {};
  }

  /**
   * returns object of views
   */
  get views() {
    // return object of views
    return {
      view   : 'page/chat/view',
      menu   : 'page/chat/menu',
      config : 'page/chat/config',
    };
  }

  /**
   * returns category list for page
   */
  get categories() {
    // return array of categories
    return ['frontend'];
  }

  /**
   * returns page descripton for list
   */
  get description() {
    // return description string
    return 'Embeddable Chat page';
  }
}