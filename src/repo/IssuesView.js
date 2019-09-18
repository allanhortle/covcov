// @flow
import React, {useEffect, useState} from 'react';
import LoadingBoundary from '../core/LoadingBoundary';
import Api from '../core/EntityApi';
import get from 'unmutable/lib/get';
import getIn from 'unmutable/lib/getIn';
import map from 'unmutable/lib/map';
import sortBy from 'unmutable/lib/sortBy';
import pipeWith from 'unmutable/lib/util/pipeWith';
import pipe from 'unmutable/lib/util/pipe';
import {blue, red, green, magenta, grey, yellow} from '../util/tag';
import ListLayout from '../affordance/ListLayout';
import Title from '../affordance/Title';
import BlockLayout from '../affordance/BlockLayout';
import TimelineItemArray from '../affordance/TimelineItemArray';


export default (props) => {
    const {name, owner} = props.repo;
    return <ListLayout
        request={Api.repo.issues.useRequest}
        payload={{name, owner}}
        id={get('number')}
        list={getIn(['repository', 'issues'])}
        listHead={['#', 'Status', 'Name']}
        renderListItem={ii => [
            `${ii.number}`,
            colorState(ii.state),
            ii.title
        ]}
        itemView={PullDescription}
        onSelect={content => {
            const match = content.match(/^(\d*)/) || [];
            return parseInt(match[1], 10);
        }}
    />;
}

function PullDescription({data}) {
    const {state, body, number, author, createdAt, updatedAt, url, comments, timelineItems} = data;
    const description = body || 'No Description';
    const descriptionLines = description.split('\r').length;
    const labels = data.labels.edges
        .map(({node}) => `{#${node.color}-fg}${node.name}{/}`)
        .join(', ');
    const rowPadding = {top: 1, bottom: 1, left: 0, right: 0};

    return <BlockLayout mouse scrollable scrollbar border="bg">
        <listtable tags align="left" height={8}  rows={[
            ['state: ', colorState(state)],
            ['number: ', `#${number}`],
            ['opened by: ', yellow(author.login)],
            ['labels: ', labels],
            ['created', `${createdAt}`],
            ['updated', `${updatedAt}`],
            ['url', `${url}`],
        ]}/>
        <Title margin={rowPadding}>Description</Title>
        <box>{description}</box>
        <Title margin={rowPadding}>Comments</Title>
        {TimelineItemArray(timelineItems)}
    </BlockLayout>;
}

function colorState(val) {
    switch(val) {
        case 'MERGED':
            return magenta(val);
        case 'CLOSED':
            return red(val);
        case 'OPEN':
            return green(val);
        default:
            return val;
    }
}
