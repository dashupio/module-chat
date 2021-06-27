// import react
import { Page, Chat } from '@dashup/ui';
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
        <Chat dashup={ props.dashup } thread={ props.page.get('_id') }>
          <div className="d-flex flex-column flex-1">
            <div className="flex-1 fit-content">
              <div className="h-100 w-100 pb-4">
                <Chat.Thread />
              </div>
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