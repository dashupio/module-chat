// import react
import { Page, Chat } from '@dashup/ui';
import React, { useState, useEffect } from 'react';

// channel page
const ChannelPage = (props = {}) => {
  // use state
  const [config, setConfig] = useState(false);
  const [messages, setMessages] = useState([]);

  // on messages
  const onMessages = (list = []) => {
    // loop
    list.forEach((message) => {
      // get found
      const found = messages.find((m) => m.id === message.id);

      // check messages
      if (found) {
        // set value
        Object.keys(message).forEach((k) => found[k] = message[k]);
      } else {
        // set message
        messages.push(message);
      }
    });

    // set messages
    setMessages([...messages]);
  };

  // on remove
  const onRemoveMessage = (list = []) => {
    // remove found
    const newMessages = messages.filter((m) => !list.find((r) => r.id === m.id));

    // set messages
    setMessages([...newMessages]);
  };

  // get messages
  const getMessages = () => {
    // return messages
    return Array.from(messages.values()).sort((a, b) => {
      // sort
      if (new Date(a.created_at) > new Date(b.created_at)) return 1;
      if (new Date(a.created_at) < new Date(b.created_at)) return -1;

      // return 0
      return 0;
    });
  };

  // use effect
  useEffect(() => {
    // add event listener
    props.dashup.socket.on(`messages.${props.page.get('_id')}`, onMessages);
    props.dashup.socket.on(`messages.${props.page.get('_id')}.remove`, onRemoveMessage);

    // thread
    props.dashup.action({
      type   : 'page',
      struct : 'channel',
    }, 'listen', props.page.get('_id')).then(onMessages);

    // return unlisten
    return () => {
      // add event listener
      props.dashup.socket.removeListener(`messages.${props.page.get('_id')}`, onMessages);
      props.dashup.socket.removeListener(`messages.${props.page.get('_id')}.remove`, onRemoveMessage);
    };
  }, [props.page.get('_id')]);

  // return jsx
  return (
    <Page { ...props } bodyClass="flex-column">
      <Page.Config show={ config } onHide={ (e) => setConfig(false) } />
      <Page.Menu onConfig={ () => setConfig(true) } onShare />
      <Page.Body>
        <Chat dashup={ props.dashup } thread={ props.page.get('_id') } messages={ getMessages() }>
          <div className="d-flex flex-column flex-1">
            <div className="flex-1 fit-content">
              <Chat.Thread />
            </div>
            <div className="flex-0">
              <Chat.Input />
            </div>
          </div>
        </Chat>
      </Page.Body>
    </Page>
  );
};

// export default
export default ChannelPage;