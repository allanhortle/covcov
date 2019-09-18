// @flow
import React, {useEffect, useState} from 'react';

export default ({margin = {}, children, top}) => {
    return <box padding={margin}><box
        tags
        top={top}
        style={{
            fg: 'black',
            bg: 'white'
        }}
        height={1}
        content={`{center}${children}{/center}`}
    /></box>
}

