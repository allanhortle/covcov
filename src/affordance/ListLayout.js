// @flow
import type {ComponentType} from 'react';
import React, {useEffect, useState} from 'react';
import LoadingBoundary from '../core/LoadingBoundary';
import Api from '../core/EntityApi';
import get from 'unmutable/lib/get';
import map from 'unmutable/lib/map';
import sortBy from 'unmutable/lib/sortBy';
import pipeWith from 'unmutable/lib/util/pipeWith';
import pipe from 'unmutable/lib/util/pipe';
import {blue, red, green, magenta, grey, yellow} from '../util/tag';
import BlockLayout from '../affordance/BlockLayout';

type Props = {
    request: Function,
    payload: Object,
    id: Function,
    list: Function,
    listHead: string[],
    renderListItem: Function,
    itemView: ComponentType<any>,
    initialValue: () => boolean,
    onSelect: Function
};

export default (props: Props) => {
    const {
        request,
        payload,
        id,
        list,
        listHead,
        initialValue = () => true,
        renderListItem,
        itemView: ItemView,
        onSelect
    } = props;

    const [index, setIndex] = useState(null);
    const message = request();

    useEffect(() => {
        message.onRequest(payload);
    }, []);

    return <LoadingBoundary message={message}>
        {(data, meta) => {
            const plainList = list(data).edges.map(ii => ii.node);
            const initialIndex = plainList.findIndex(initialValue);
            const selectedIndex = (index == null) ? initialIndex : index;
            const currentItem = plainList[selectedIndex];
            log(plainList)

            return <box height="100%">
                <box
                    top={0}
                    width="40%"
                    height="100%"
                    border={{type: 'line', left: false, right: true, top: false, bottom: false}}
                >
                    <listtable
                        align="left"
                        mouse={true}
                        keys={true}
                        focused={true}
                        vi={true}
                        tags={true}
                        pad={0}
                        height="100%"
                        width="100%"
                        selected={selectedIndex + 1}
                        style={{
                            selected: {
                                fg: 'black',
                                bg: 'yellow'
                            },
                            scrollbar: {
                                bg: 'blue'
                            }
                        }}
                        rows={pipeWith(
                            plainList,
                            map(renderListItem),
                            _ => [listHead].concat(_)
                        )}
                        onSelect={(data, index) => setIndex(index - 1)}
                    />
                </box>
                <box top={0} left="40%" height="100%" width="60%">
                    {currentItem && <ItemView data={currentItem} />}
                </box>
             </box>;
        }}
    </LoadingBoundary>;
}

