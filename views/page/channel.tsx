// import react
import { Box, Stack, Page, Chat } from '@dashup/ui';
import React, { useState } from 'react';

// channel page
const ChannelPage = (props = {}) => {
  // use state
  const [share, setShare] = useState(false);
  const [config, setConfig] = useState(false);

  // return jsx
  return (
    <Page { ...props } bodyClass="flex-column">
      <Page.Share show={ share } onHide={ (e) => setShare(false) } />
      <Page.Config show={ config } onHide={ (e) => setConfig(false) } />
      <Page.Menu onConfig={ () => setConfig(true) } presence={ props.presence } onShare={ () => setShare(true) } />
      <Page.Body>
        <Chat dashup={ props.dashup } thread={ props.page.get('_id') } page={ props.page }>
          <Stack flex={ 1 } spacing={ 2 }>
            <Chat.Thread />
            <Chat.Input />
          </Stack>
        </Chat>
      </Page.Body>
    </Page>
  );
};

// export default
export default ChannelPage;