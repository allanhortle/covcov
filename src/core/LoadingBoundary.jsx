import React from 'react';
import {LoadingBoundary} from 'react-enty';

export default function(props) {
    const {message, children} = props;
    return <LoadingBoundary
        fallback={() => <box width="100%" height="100%" top={1} left={1}>Loading...</box>}
        error={() => <box
            height="100%"
            width="100%"
            border={{
                type: 'line',
            }}
            class={{
                style: {
                    border: {
                        fg: 'red'
                    }
                }
            }}
            tags={true}
            label="{red-fg} Error {/red-fg}"
            children={message.requestError.stack}
        />}
        message={message}
        children={children}
    />;
}
