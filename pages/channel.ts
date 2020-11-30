
// import page interface
import fetch from 'node-fetch';
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
    this.countAction = this.countAction.bind(this);
    this.embedAction = this.embedAction.bind(this);
    this.deafenAction = this.deafenAction.bind(this);
    this.listenAction = this.listenAction.bind(this);
    this.removeAction = this.removeAction.bind(this);
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
      count  : this.countAction,
      embed  : this.embedAction,
      deafen : this.deafenAction,
      listen : this.listenAction,
      remove : this.removeAction,
    };
  }

  /**
   * returns object of views
   */
  get views() {
    // return object of views
    return {
      chat : 'chat',
      
      view     : 'page/channel/view',
      menu     : 'page/channel/menu',
      config   : 'page/channel/config',
      connects : 'page/channel/connects',
    };
  }

  /**
   * returns category list for page
   */
  get categories() {
    // return array of categories
    return ['Chat'];
  }

  /**
   * returns page descripton for list
   */
  get description() {
    // return description string
    return 'Internal chat channel page';
  }

  /**
   * send action
   *
   * @param param0 
   * @param message 
   * @param embeds 
   */
  async removeAction(opts, subject, id) {
    // create message
    await this.dashup.connection.rpc(opts, 'message.remove', id);

    // emit to room
    this.dashup.connection.rpc(opts, 'socket.room', subject, `messages.${subject}.remove`, [{ id }]);

    // return message
    return true;
  }

  /**
   * send action
   *
   * @param param0 
   * @param message 
   * @param embeds 
   */
  async sendAction(opts, { temp, subject, message, embeds }) {
    // create message
    const actualMessage = await this.dashup.connection.rpc(opts, 'message.update', opts.user, {
      temp,
      embeds,
      subject,
      message,
    });

    // emit to room
    this.dashup.connection.rpc(opts, 'socket.room', subject, `messages.${subject}`, [actualMessage]);
    this.dashup.connection.event(opts, 'message.sent', subject, actualMessage);

    // return message
    return actualMessage;
  }

  /**
   * listen action
   *
   * @param data 
   * @param subject 
   */
  async countAction(opts, subject) {
    // deafen action
    return this.dashup.connection.rpc(opts, 'message.count', subject);
  }

  /**
   * listen action
   *
   * @param data 
   * @param subject 
   */
  async listenAction(opts, subject) {
    // listen
    const messages = await this.dashup.connection.rpc(opts, 'message.query', subject);

    // listen
    this.dashup.connection.rpc(opts, 'message.subscribe', subject);

    // return true
    return messages;
  }

  /**
   * listen action
   *
   * @param data 
   * @param subject 
   */
  async deafenAction(opts, subject) {
    // deafen action
    this.dashup.connection.rpc(opts, 'message.unsubscribe', subject);

    // return true
    return true;
  }

  /**
   * embed parser
   * @param url 
   */
  async embedAction(opts, url) {
    // try/catch
    try {
      // load from embed.rocks
      const res = await fetch(`https://api.embed.rocks/api?url=${encodeURIComponent(url)}&autoplay=1`, {
        headers : {
          'x-api-key' : this.dashup.config.secret,
        },
      });

      // get json
      const data = await res.json();

      // author
      data.author = data.oembed ? {
        url  : data.oembed.author_url,
        name : data.oembed.author_name,
      } : null;
      data.provider = {
        url  : data.oembed ? data.oembed.provider_url : url,
        name : data.oembed ? data.oembed.provider_name : data.site,
      };

      // set html
      if (data.html && data.html.includes('iframe')) {
        // set html
        data.html = data.html.split('<iframe')[1].split('/iframe')[0];
        data.html = `<iframe class="embed-responsive-item" frameborder="0" scrolling="no" allowfullscreen="true"${data.html.replace(/style="[a-zA-Z0-9\s:;.()\-,]*"/gi, '')}/iframe>`;
      } else if (data.html && data.html.includes('<video')) {
        // set html
        data.tag = 'video';
        data.html = (data.html || '').split('<video')[1].split('/video')[0];
        data.html = `<video ${data.html.replace(/style="[a-zA-Z0-9\s:;.()\-,]*"/gi, '')}/video>`;
      } else if (data.type === 'rich' && data.images.length) {
        data.html = `<img src="${data.images[0].url}" class="img-fluid" />`;
      }

      // delete logic not required
      delete data.article;
      delete data.oembed;
      delete data.site;

      // return data
      return data;
    } catch (e) { console.log(e) }

    // return null
    return null;
  }
}