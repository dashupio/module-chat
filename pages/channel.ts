
// import page interface
import { Struct } from '@dashup/module';

/**
 * build address helper
 */
export default class ChannelPage extends Struct {

  /**
   * returns page type
   */
  get type() {
    // return page type label
    return 'channel';
  }

  /**
   * returns page type
   */
  get icon() {
    // return page type label
    return 'fa fa-hashtag';
  }

  /**
   * returns page type
   */
  get title() {
    // return page type label
    return 'Channel Page';
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
      view   : 'page/channel/view',
      menu   : 'page/channel/menu',
      config : 'page/channel/config',
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
    return 'Internal chat channel';
  }
}