
// import page interface
import { Struct } from '@dashup/module';

/**
 * build address helper
 */
export default class ChannelPage extends Struct {
  /**
   * construct discord connector
   *
   * @param args 
   */
  constructor(...args) {
    // run super
    super(...args);
    
    // bind methods
    this.sendAction = this.sendAction.bind(this);
    this.listenAction = this.listenAction.bind(this);
  }

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
  get actions() {
    // return object of views
    return {
      send   : this.sendAction,
      listen : this.listenAction,
    };
  }

  /**
   * returns object of views
   */
  get views() {
    // return object of views
    return {
      chat : 'chat',
      
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

  /**
   * send action
   *
   * @param param0 
   * @param message 
   * @param embeds 
   */
  async sendAction({ session, user }, { subject, message, embeds }) {
    // create message
    const actualMessage = await this.dashup.connection.rpc('update.message', user, {
      embeds,
      subject,
      message,
    });

    // emit to room
    this.dashup.connection.rpc('socket.room', subject, `${subject}.messages`, [actualMessage]);

    // return message
    return actualMessage;
  }

  /**
   * listen action
   *
   * @param data 
   * @param subject 
   */
  async listenAction({ session }, subject) {
    // listen
    const messages = await this.dashup.connection.rpc('query.message', subject);

    // listen
    this.dashup.connection.rpc('socket.emit', session, `${subject}.messages`, messages);
    this.dashup.connection.rpc('subscribe.message', session, subject);
  }
}