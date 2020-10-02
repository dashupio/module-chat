
// require dependencies
import uuid             from 'uuid';
import fetch            from 'node-fetch';
import config           from 'config';
import markdownIt       from 'markdown-it';
import { EventEmitter } from 'events';

/**
 * create social helper class
 *
 * @extends Helper
 */
class ChatHelper extends EventEmitter {
  /**
   * construct social helper
   */
  constructor(...args) {
    // Run super
    super(...args);

    // embed/create
    this.alert = this.alert.bind(this);
    this.embed = this.embed.bind(this);
    this.create = this.create.bind(this);
    this.provider = this.provider.bind(this);
    this.providers = this.providers.bind(this);

    // build placement helper
    this.__markdown = markdownIt({
      html     : true,
      breaks   : true,
      linkify  : true,
      xhtmlOut : true,
    }).disable(['image']);
  }

  /**
   * creates social post
   *
   * @param  {User}   me
   * @param  {Object} post
   * @param  {Array}  on
   *
   * @return {Post}
   */
  async create(me, post, on = []) {
    // text
    let text = `${post.message || ''}`;

    // parse tags
    const tags = await this.parseTags(post);

    // create text
    tags.forEach((tag) => {
      // text version
      text = text.split(tag.replace).join(tag.text);
    });

    // parsed
    let parsed = await this.parseText(text, tags);

    // loop
    tags.forEach((tag) => {
      // text version
      parsed = parsed.split(tag.text).join(tag.sanitised);
    });

    // post data
    const data = {
      on,
      by   : me ? [me, ...(post.by || [])] : (post.by || []),
      temp : post.temp || uuid(),
      type : post.type || 'text',
      tags : [`type:${post.type || 'text'}`, ...(me ? [me, ...(post.by || [])] : (post.by || [])).map((by) => {
        // add own user tag
        return `user:${by.id || by.get('_id').toString()}`;
      }), ...(on.map((onModel) => {
        // return model type
        return `${onModel.constructor.name}:${onModel.get('_id').toString()}`;
      })), ...(post.on || []), ...(tags.map((tag) => {
        // return text tag
        return `${tag.type}:${tag.id}`;
      }))].map(tag => tag.toLowerCase()),
      embeds  : await Promise.all((post.embeds || []).map(embed => this.embed(embed))),
      parsed  : parsed,
      privacy : post.privacy || 'public',
      message : text,
      subject : post.subject || null,
    };

    // created at
    if (post.created_at) data.created_at = post.created_at;

    // create new post
    const message = new Message(data);

    // save model
    await message.save(me);

    // done
    this.eden.hook('create.message', message);

    // return social post
    return message;
  }

  /**
   * alert
   *
   * @param param0 
   * @param message 
   */
  async alert({ from, page, item }, message) {
    // tags
    const tags = this.parseTags(message.get('message'));

    // test
    let text = message.get('message');
    tags.forEach((tag) => {
      // new text
      text = text.split(tag.text).join(tag.title);
    });

    // check tags for important alerts
    await Promise.all(tags.map(async (tag) => {
      // check tag
      if (tag.type !== 'user') return;

      // alert
      alertHelper.create(from, page, [await (await Member.findById(tag.id)).get('user')], 'important', from ? {
        opts : {
          icon : (((((await from.sanitise()).avatar || [])[0] || {}).thumbs || {})['2x-sq'] || {}).url || `${config.get('cdn.url') || '/'}public/assets/icons/ms-icon-144x144.png`,
          body : text,
          data : {
            url : `/app/${page.get('_id')}`,
          },
          vibrate : [200, 100, 200],
        },
        title : `${from ? from.name() : 'Someone'} mentioned you in ${page.get('name')}`,
      } : null);

      // create on item
      if (item) alertHelper.create(from, item, [await (await Member.findById(tag.id)).get('user')], 'important');
    }));

    // post alert
    await alertHelper.create(from, page);

    // create alert
    if (item) await alertHelper.create(from, item);
  }

  /**
   * gets models from tags
   *
   * @param  {Array} tags
   * @param  {Post}  post
   *
   * @return {*}
   */
  async getModels(tags, post) {
    // return tags
    return (await Promise.all(tags.map(async (tag) => {
      // get hooked tag
      tag = {
        post,
        title : tag,
      };

      // hook
      await this.eden.hook('tag.model', tag);

      // return
      if (!tag.model) return;

      // return tag
      return tag.model;
    }))).filter(tag => tag);
  }

  /**
   * renders tags
   *
   * @param  {Array} tags
   * @param  {Post}  post
   *
   * @return {*}
   */
  async getTags(tags, post) {
    // return tags
    return (await Promise.all(tags.map(async (tag) => {
      // get hooked tag
      tag = {
        post,
        title : tag,
      };

      // hook
      await this.eden.hook('tag.render', tag);

      // return
      if (!tag.name) return;

      // delete post
      delete tag.post;

      // return tag
      return tag;
    }))).filter(tag => tag);
  }

  /**
   * parse tags out of message text
   *
   * @param  {String} text
   *
   * @return {Array}
   */
  parseTags(data) {
    // add placeholders
    return [...(((data.message || '').match(/<(\w+):(.*?)\|(\w+)>/g) || []).map((val) => {
      // replace tag
      const tag = val.replace('<', '').replace('>', '');

      // return tag
      const parsed = {
        id      : tag.split('|')[1].trim(),
        type    : tag.split(':')[0].trim(),
        uuid    : uuid(),
        text    : `@${tag.split(':')[1].split('|')[0].trim()}`,
        title   : tag.split(':')[1].split('|')[0].trim(),
        replace : val,
      };

      // return tag
      return Object.assign(parsed, {
        sanitised : `<${parsed.type}:${parsed.title}|${parsed.id}>`,
      });
    })), ...(((data.message || '').match(/(?:[\w_＠@][＠@])|[＠@]([\w_]{1,15})(?=$|[^\w_])/g) || []).map((val) => {
      // return data
      const parsed = {
        id        : null,
        type      : 'user',
        uuid      : uuid(),
        text      : val,
        replace   : val,
        sanitised : `<user:${val.replace('@', '')}|null>`,
      };

      // fix
      data.message = data.message.split(val).join(parsed.sanitised);

      // return fixed
      return parsed;
    }))];
  }

  /**
   * parse text from message
   *
   * @param  {String} text
   *
   * @return {String}
   */
  parseText(message, tags) {
    // get text
    message = message.split('​').join('');

    // parse tags out
    if (!tags) tags = this.parseTags({ message });

    // loop tags
    tags.forEach((tag) => {
      // remove bad html
      message = message.replace(tag.text, tag.uuid);
    });

    // Set value
    let value = this.__markdown.renderInline(message);

    // loop tags
    tags.forEach((tag) => {
      // remove bad html
      value = value.replace(tag.uuid, tag.sanitised);
    });

    // return value
    return value;
  }
}

/**
 * export social helper
 *
 * @type {ChatHelper}
 */
export default new ChatHelper();
