// @flow
import React from 'react';

const logc = (name, {yi, yl, height} = {}) => console.log(`${name}:: yi: ${yi}, yl: ${yl}, height: ${height}`);

function renderer(coords) {
    let offset = 0;
    let rowIndex = 0;

    return (el, i) => {
        const {lpos} = this.children[i];
        el.shrink = true;
        el.position.left = 0;

        offset += this.children.slice(rowIndex, i).reduce((out, el) => {
            if (!this.isRendered(el)) return out;
            out = Math.max(out, el.lpos.yl - el.lpos.yi);
            return out;
        }, 0);

        rowIndex = i;
        el.position.top = offset;

    };
}

export default function BlockLayout(props) {
    return <layout width="100%" height="100%" renderer={renderer} {...props} />;
}
