
// import page interface
import fetch from 'node-fetch';
import urlRegex from 'url-regex';
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
    return 'fad fa-hashtag text-success';
  }

  /**
   * returns page type
   */
  get title() {
    // return page type label
    return 'Chat';
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
      view : 'page/channel',
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
    return 'Chat channels for real time communication';
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
  async sendAction(opts, { by, temp, subject, message }) {
    // create message
    let actualMessage = await this.dashup.connection.rpc(opts, 'message.update', by || opts.user, {
      temp,
      embeds : [],
      subject,
      message,
    });

    // ge total
    const total = await this.dashup.connection.rpc(opts, 'message.count', subject);

    // emit to room
    await this.dashup.connection.rpc(opts, 'alert', { id : subject.split('.')[0] });
    await this.dashup.connection.rpc(opts, 'socket.room', subject, `count.${subject}`, total);
    await this.dashup.connection.rpc(opts, 'socket.room', subject, `messages.${subject}`, {
      data : [actualMessage],
      total,
    });
    await this.dashup.connection.event(opts, 'message.sent', subject, actualMessage);

    // load embeds
    const embeds = (await Promise.all((message.match(urlRegex()) || []).map(async (entry) => {
      // await load
      const data = await this.embedAction(opts, entry);

      // check adata
      if (!data || !data.type) return;

      // parsed
      return {
        data,
        url  : entry,
        type : data.type,
      };
    }))).filter((e) => e);

    // check entries
    if (embeds.length) {
      // create message
      actualMessage = await this.dashup.connection.rpc(opts, 'message.update', actualMessage.id, by || opts.user, {
        temp,
        embeds,
        subject,
        message,
      });

      // emit again with embeds
      await this.dashup.connection.rpc(opts, 'socket.room', subject, `messages.${subject}`, {
        data : [actualMessage],
        total,
      });
    }

    // parse tags
    Array.from(message.matchAll(/[@#]\[([^\]]+)\]\(([^\)]+)\)/g) || []).map((match) => {
      // match out
      const [str, name, id] = match;

      // alert
      this.dashup.connection.rpc(opts, 'alert', { id : subject.split('.')[0], members : [id], type : 'important', push : {
        body : message,
        icon : actualMessage?.by?.avatar ? actualMessage.by.avatar.replace('/storage.googleapis.com', '') : null,
        data : {
          url : `https://dashup.io/app/${subject.split('.').join('/')}`,
        },
        image   : actualMessage?.by?.avatar ? actualMessage.by.avatar.replace('/storage.googleapis.com', '') : null,
        badge   : 'https://static.dashup.io/public/assets/images/icon-white.svg',
        title   : `${actualMessage?.by?.name} has mentioned you in a message`,
        silent  : false,
        vibrate : [100, 50, 100]
      } });
    });

    // return message
    return actualMessage;
  }

  /**
   * listen action
   *
   * @param data 
   * @param subject 
   */
  countAction(opts, subject) {
    // listen
    this.dashup.connection.rpc(opts, 'message.count.subscribe', subject);

    // deafen action
    return this.dashup.connection.rpc(opts, 'message.count', subject);
  }

  /**
   * listen action
   *
   * @param data 
   * @param subject 
   */
  async listenAction(opts, { subject, skip, limit }) {
    // listen
    const messages = await this.dashup.connection.rpc(opts, 'message.query', { subject, skip, limit });

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
    // data
    let data = {};

    // try/catch
    try {
      // load from embed.rocks
      const res = await fetch(`https://api.embed.rocks/api?url=${encodeURIComponent(url)}&autoplay=1`, {
        headers : {
          'x-api-key' : this.dashup.config.secret,
        },
      });

      // get json
      data = await res.json();
    } catch (e) {}

    // try/catch
    try {
      // author
      data.author = data.oembed ? {
        url  : data.oembed.author_url,
        name : data.oembed.author_name,
      } : null;
      data.provider = {
        url  : data.oembed ? data.oembed.provider_url : url,
        name : data.oembed ? data.oembed.provider_name : data.site,
      };

      // check type
      if (url.includes('videodelivery.net')) {
        // id
        const id = url.split('/').pop();

        // create embed
        data.type = 'video';
        data.html = `<iframe class="embed-responsive-item" src="https://iframe.videodelivery.net/${id}" allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;" frameborder="0" scrolling="no" allowfullscreen="true"></iframe>`;
      } else if (data.html && data.html.includes('iframe')) {
        // set html
        data.html = data.html.split('<iframe')[1].split('/iframe')[0];
        data.html = `<iframe class="embed-responsive-item" frameborder="0" scrolling="no" allowfullscreen="true"${data.html.replace(/style="[a-zA-Z0-9\s:;.()\-,]*"/gi, '')}/iframe>`;
      } else if (data.html && data.html.includes('<video')) {
        // set html
        data.type = 'video';
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